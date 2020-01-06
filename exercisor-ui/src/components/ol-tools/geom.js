export function lerpPositionsToCoord(from, to, fraction) {
  const factor = Math.min(1, Math.max(fraction, 0));
  const dLat = to.lat - from.lat;
  const dLon = to.lon - from.lon;
  const angle = Math.atan2(dLat, dLon);
  const length = Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2));
  const nextLength = factor * length
  return [
    from.lon + nextLength * Math.cos(angle),
    from.lat + nextLength * Math.sin(angle),
  ];
}

/**
 * Gets coordinates for a distance along a route.
 *
 * @param {Number} distance      Distance needed.
 * @param {Array}  route         Each item `{lon: {Number}, lat: {Number}, distance: {Number}}`.
 * @param {Number} idxStartleg   Index in route to start generating coordinats.
 * @param {Number} startFraction Fraction along starting index/leg to start at.
 * @param {Object} legStart      The format of route items, added at no cost to coordinates.
 *
 * @return {Object} Returns the coords and the meta-data with the coords,
 *                  the remainingDistance needed to be plotted over other route
 *                  what idxEndLeg (index/leg we ended on) and its endFraction.
 */
export function getLineStringData(
  distance,
  route,
  idxStartLeg,
  startFraction,
  legStart,
) {
  const coords = [];
  let remainingDistance = distance;

  // We shouldn't end up here, but if so return
  if (remainingDistance === 0) return {
    coords, remainingDistance,
    idxEndLeg: idxStartLeg, endFraction: startFraction
  };

  let idxEndLeg = idxStartLeg;
  let endFraction = startFraction;
  coords.push([legStart.lon, legStart.lat]);

  // Going through adding up legs until we reach the needed length
  route
    .some((leg, idxLeg) => {
      // Should return true when we are done with the distance

      // Skipping legs already used
      if (idxLeg < idxStartLeg) return false;

      // We need entire leg an probably more
      if (leg.distance <= remainingDistance) {
        if (leg.lon !== coords[0][0] && leg.lat !== coords[0][1]) coords.push([leg.lon, leg.lat]);
        remainingDistance -= leg.distance;
        endFraction = 0;
        idxEndLeg = idxLeg + 1;
        return remainingDistance === 0;

      // The leg is larger than we need
      } else {

        // This may overshoot for now, if so will be handled just below
        endFraction = startFraction + remainingDistance / leg.distance;

        // But we had used up so much we actually need more
        if (endFraction > 1) {
          coords.push([leg.lon, leg.lat]);
          remainingDistance -= (1 - startFraction) * leg.distance;
          // Since we'll continue on the next leg we're at the beginning of it
          idxEndLeg = idxLeg + 1;
          startFraction = 0;
          endFraction = 0;
          return false;

        // We just need a part of the leg
        } else {
          coords.push(lerpPositionsToCoord(
            idxLeg === 0 ? legStart: route[idxLeg - 1],
            leg,
            endFraction,
          ));
          remainingDistance = 0;
          // We'll still be on this leg next time
          idxEndLeg = idxLeg;
          return remainingDistance === 0;
        }
      }
    });
  return {
    coords, remainingDistance, idxEndLeg, endFraction,
  };
}

/**
 * Gets line string data groups per event along routes.
 *
 * @param {Array}    events    List of event objects, each having a distance in [km].
 * @param {Array}    waypoints Array of pairs of from and to places of the routes.
 * @param {Function} getRoute  Given a pair of strings returns a route.
 *
 * @return {Object} Returns lines and a flag indicating if it managed to plot
 *                  out all the events. Each item in lines is a group of lines
 *                  needed to draw an event. If there's more than one in the
 *                  group it indicates that the event is spread out over several
 *                  routes.
 */
export function getLineStringsData(events, waypoints, getRoute) {
  // We need the events in chronological order
  const eventsCopy = events.slice().reverse();

  let idxWaypointPair = 0;
  const lines = [];
  let exhausted = true;
  let idxStartLeg = 0;
  let startFraction = 0;
  let legStart = null;

  // Each event gets a set of lines
  for (let idxEvent=0; idxEvent<eventsCopy.length; idxEvent++) {
    // The lines group used for this event
    lines.push([]);

    // converts events distance to meters
    let distance = eventsCopy[idxEvent].distance * 1000;

    // The distance may need to be plotted to several routes
    while (distance != null && distance > 0) {
      const route = getRoute(waypoints[idxWaypointPair])

      // We are out of routes
      if (route == null) {
        exhausted = false;
        break;
      }
      if (legStart == null) legStart = route[0]

      // Getting new coords
      const {coords, remainingDistance, idxEndLeg, endFraction} = getLineStringData(
        distance,
        route,
        idxStartLeg,
        startFraction,
        legStart,
      );
      lines[idxEvent].push(coords);
      console.log("D", distance, "C", getDistanceAlongRoute(
        route, idxStartLeg, startFraction, idxEndLeg, endFraction));

      // Info needed by the next event
      idxStartLeg = idxEndLeg;
      startFraction = endFraction;
      distance = remainingDistance;
      legStart = {
        lon: coords[coords.length - 1][0],
        lat: coords[coords.length - 1][1],
        distance: 0,
      };

      // If we need more for this event we need a new route
      // that means we'll start it from the beginning
      if (distance > 0) {
        idxWaypointPair += 1;
        startFraction = 0;
        idxStartLeg = 0;
        legStart = null;
      }
    }
  }
  return {
    lines: lines.filter(evtLines => evtLines.length > 0),
    exhausted,
  };
}

export function getDistanceAlongRoute(
  route, idxStartLeg, startFraction, idxEndLeg, endFraction,
) {
  let distance = 0;
  let fromFraction = startFraction;
  for (let idxLeg=idxStartLeg; idxLeg<=idxEndLeg; idxLeg++) {

    let legDistance = 0;
    try {
      legDistance = route[idxLeg].distance;
    } catch(error) {
      console.warning(`Missing distance info on leg ${idxLeg}.`, route);
    }

    if (idxLeg === idxEndLeg) {
      distance += (endFraction - fromFraction) * legDistance;
    } else {
      distance += (1 - fromFraction) * legDistance;
      fromFraction = 0;
    }
  }
  return distance;
}
