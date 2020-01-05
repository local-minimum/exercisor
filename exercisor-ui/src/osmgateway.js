import $ from 'jquery';

function scoreLocation(loc, ref) {
  const refArr = ref.split(',').map(item => item.trim());
  const locArr = loc.split(', ');
  return locArr
    .filter(item => refArr.some(refItem => item.startsWith(refItem)))
    .length;
}

function getBestLocationMatch(results, place) {
    console.log(place, results);
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

function extractCoordinatesFromLeg(leg) {
  const coords = leg.steps.map(({distance, maneuver}) => ({
    lon: maneuver.location[0],
    lat: maneuver.location[1],
    distance,
  }));
  return coords;
}

function extractCoordinates(result) {
    const { routes } = result;
    if (routes.length === 0) return [];
    const route = routes[0];
    return route.legs.map(extractCoordinatesFromLeg).flat();
}

export function getRouteCoordinates(fromCoords, toCoords) {
    return $
      .getJSON(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?overview=false&geometries=polyline&steps=true`)
      .then(extractCoordinates)
}
