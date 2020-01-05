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

function extractStepCoordinates(step, fromCoords) {
  const {distance, intersections, maneuver} = step;
  const endLocation = {
    lon: maneuver.location[0],
    lat: maneuver.location[1],
    distance: distance / 1000,
  };
  let prevCoordArr = [fromCoords.lon, fromCoords.lat];
  const intersectionCoords = intersections
    .map(intersection => {
        if (intersection.location == null) return null;
        const distance = calcDistance(prevCoordArr, intersection.location);
        prevCoordArr = intersection.location;
        return {
          lon: intersection.location[0],
          lat: intersection.location[1],
          distance: distance / 1000,
        };
    })
    .filter(location =>
      location != null &&
      (location.lon !== endLocation.lon || location.lat !== endLocation.lat)
    );

  if (intersectionCoords.length === 0) return [endLocation];

  intersectionCoords.push({
    lon: endLocation.lon,
    lat: endLocation.lat,
    distance: calcDistance(prevCoordArr, maneuver.location),
  });
  const distFactor = distance / intersectionCoords
    .reduce((acc, loc) => acc + loc.distance, 0);
  const result = intersectionCoords.map(({lat, lon, distance}) => ({
    distance: distance * distFactor, lat, lon
  }));
  return result
}

function extractCoordinatesFromLeg(leg, fromCoords) {
  let prevCoords = fromCoords;
  return leg.steps.map(step => {
    const coords = extractStepCoordinates(step, prevCoords);
    const {lon, lat} = coords[coords.length - 1];
    prevCoords = [lon, lat];
    return coords;
  });
}

function extractCoordinates(result, fromCoords, toCoords) {
    const { routes } = result;
    if (routes.length === 0) return [];
    const route = routes[0];
    const coords = route.legs
      .map(leg => extractCoordinatesFromLeg(leg, fromCoords))
      .flat(2)
      .filter(leg => leg.distance > 0);
    return [{
        lon: fromCoords.lon,
        lat: fromCoords.lat,
        distance: 0,
    }].concat(coords);
}

export function getRouteCoordinates(fromCoords, toCoords) {
    return $
      .getJSON(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?overview=false&geometries=polyline&steps=true`)
      .then(result => extractCoordinates(result, fromCoords, toCoords))
}
