import $ from 'jquery';

function scoreLocation(loc, ref) {
  const refArr = ref.split(',').map(item => item.trim());
  const locArr = loc.split(', ');
  return locArr
    .filter(item => refArr.some(refItem => item.startsWith(refItem)))
    .length;
}

function getBestLocationMatch(results, place) {
    let bestScore = null;
    let bestRes = null;
    results.forEach(res => {
      const score = scoreLocation(res.display_name, place);
      if (bestScore == null || score > bestScore) {
        bestScore = score;
        bestRes = res
      }
    });
    return bestRes;
}

export function getLocation(place) {
  return $
    .getJSON(`https://nominatim.openstreetmap.org/search?q=${encodeURI(place)}&format=json`)
    .then(res => getBestLocationMatch(res, place));
}

function calcDistance(fromArr, toArr) {
  return Math.sqrt(
    Math.pow(fromArr[0] - toArr[0], 2) +
    Math.pow(fromArr[1] - toArr[1], 2)
  );
}

function extractStepCoordinates(step, toCoordsArr, firstLegFirstStep) {
  const {distance, intersections, maneuver} = step;

  let prevCoordArr = maneuver.location;
  const intersectionCoords = intersections
    .map(intersection => {
        if (intersection.location == null) return null;
        const coordsDistance = calcDistance(prevCoordArr, intersection.location);
        prevCoordArr = intersection.location;
        return {
          lon: intersection.location[0],
          lat: intersection.location[1],
          coordsDistance: coordsDistance,
        };
    })
    .filter(location =>
      location != null &&
      (location.lon !== toCoordsArr[0] || location.lat !== toCoordsArr[1])
    );

  if (intersectionCoords.length === 0) return [{
    lon: toCoordsArr[0],
    lat: toCoordsArr[1],
    distance,
  }];

  intersectionCoords.push({
    lon: toCoordsArr[0],
    lat: toCoordsArr[1],
    coordsDistance: calcDistance(prevCoordArr, toCoordsArr),
  });
  const distFactor = distance / intersectionCoords.reduce((acc, loc) => acc + loc.coordsDistance, 0);
  const result = intersectionCoords.map(({lat, lon, coordsDistance}) => ({
    distance: coordsDistance * distFactor, lat, lon
  }));
  if (firstLegFirstStep) {
    return [{
      lon: maneuver.location[0],
      lat: maneuver.location[1],
      distance: 0,
    }].concat(result)
  }
  return result
}

function getCoordFromStep(step, toCoordsArr) {
  if (step == null) return toCoordsArr;
  return step.maneuver.location;
}

function extractCoordinatesFromLeg(leg, toCoordsArr, firstLeg) {
  return leg.steps.map((step, idxStep) => {
    const coords = extractStepCoordinates(
      step,
      getCoordFromStep(leg.steps[idxStep + 1], toCoordsArr),
      firstLeg && idxStep === 0,
    );
    return coords;
  });
}

function getCoordFromLeg(leg, toCoords) {
    if (leg == null) return [Number(toCoords.lon), Number(toCoords.lat)];
    return getCoordFromStep(leg.steps[0]);
}

function sumRouteFromRawRoute(route) {
  return route.legs
    .reduce(
      (acc, leg) => acc + leg.steps.reduce(
        (acc2, step) => acc2 + step.distance, 0
      ),
      0
    );
}

function sumRouteFromCoords(coords) {
  return coords.reduce((acc, { distance }) => acc + distance, 0);
}

function extractCoordinates(result, toCoords) {
    const { routes } = result;
    if (routes.length === 0) return [];
    const route = routes[0];
    const coords = route.legs
      .map((leg, idx) => {
        const toCoordsArr = getCoordFromLeg(route.legs[idx + 1], toCoords);
        return extractCoordinatesFromLeg(leg, toCoordsArr, idx === 0)
      })
      .flat(2)
      .filter((leg, idx) => leg.distance > 0 || idx === 0);
    return coords;
}

export function getRouteCoordinates(fromCoords, toCoords) {
    return $
      .getJSON(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?overview=false&geometries=polyline&steps=true`)
      .then(result => extractCoordinates(result, toCoords))
}
