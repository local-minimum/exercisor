import { jsonRequest, emptyOrNull } from './util';

const BASE_URL = '/exercisor/api';

export const getMySettings = () => {
  return jsonRequest(`${BASE_URL}/my/settings`);
}

export const getUserEventList = (user) => {
  return jsonRequest(`${BASE_URL}/user/${user}/event`);
}

const str2minutes = (str) => {
  const arr = str.split(":");
  if (arr.length === 1) return str;
  if (arr.length === 2) return Number(arr[0]) + Number(arr[1]) / 60;
  if (arr.length === 3) return Number(arr[0]) * 60 + Number(arr[1]) + Number(arr[2]) / 60;
}

const safeDate = (str) => new Date(str).toISOString().split("T")[0]

export const putEvent = (user, evt) => {
  const data = {
    date: safeDate(evt.date),
    duration: emptyOrNull(evt.duration) ? null : str2minutes(evt.duration),
    distance: emptyOrNull(evt.distance) ? null : Number(evt.distance),
    calories: emptyOrNull(evt.calories) ? null : Number(evt.calories),
    type: evt.type,
  };
  Object.keys(data).forEach((key) => (data[key] == null) && delete data[key]);
  return jsonRequest(
    `${BASE_URL}/user/${user}/event`,
    data,
    'PUT',
  );
}

export const postEvent = (user, id, evt) => {
  const data = {
    date: safeDate(evt.date),
    duration: emptyOrNull(evt.duration) ? null : str2minutes(evt.duration),
    distance: emptyOrNull(evt.distance) ? null : Number(evt.distance),
    calories: emptyOrNull(evt.calories) ? null : Number(evt.calories),
    type: evt.type,
  };
  Object.keys(data).forEach((key) => (data[key] == null) && delete data[key]);
  return jsonRequest(
    `${BASE_URL}/user/${user}/event/${id}`,
    data,
    'POST',
  );
}

export const deleteEvent = (user, id) => {
  const data = {};
  return jsonRequest(
    `${BASE_URL}/user/${user}/event/${id}`,
    data,
    'DELETE',
  );
}

export const getGoals = (user, year) => {
  return jsonRequest(
      `${BASE_URL}/user/${user}/goal/${year}`,
    );
}

const extractNullableGoal = (goals, path) => {
    if (goals == null) return null;
    let val = goals;
    path.forEach(key => {
      val = val != null ? val[key] : null;
    });
    return val === '' ? null : val;
}

export const upsertGoals = (user, year, goals) => {
  const data = {
    "sum-events": extractNullableGoal(goals, ['sums', 'events']),
    "weekly-dist": extractNullableGoal(goals, ['weekly', 'distance']),
    "route": goals.route,
  };
  return jsonRequest(
    `${BASE_URL}/user/${user}/goal/${year}`,
    data,
    'POST',
  );
}

export const registerUser = (user, password) => {
  const data = { user, password };
  return jsonRequest(
    `${BASE_URL}/user`,
    data,
    'PUT',
  );
}

export const putRoute = (user, name, waypoints) => {
  const data = { name, waypoints: waypoints.map(([from, to]) => `${from}|${to}`) };
  return jsonRequest(
    `${BASE_URL}/user/${user}/route`,
    data,
    'PUT',
  );
}

export const postRoute = (user, routeId, name, waypoints) => {
  const data = { name, waypoints: waypoints.map(([from, to]) => `${from}|${to}`) };
  return jsonRequest(
    `${BASE_URL}/user/${user}/route/${routeId}`,
    data,
    'POST',
  );
}

export const getUserRouteDesigns = (user) => {
  return jsonRequest(
    `${BASE_URL}/user/${user}/route`,
  );
}

export const getPublicRouteDesigns = () => {
  return jsonRequest(`${BASE_URL}/route`);
}

export const postLogin = (user, password) => {
  const data = { user, password };
  return jsonRequest(
    `${BASE_URL}/user`,
    data,
    'POST',
  );
}

export const deleteLogin = () => {
  return jsonRequest(
    `${BASE_URL}/user`,
    {},
    'DELETE',
  );
}
