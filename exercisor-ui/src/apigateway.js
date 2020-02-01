import { jsonRequest } from './util';

const BASE_URL = '/exercisor/api';

export const getUserEventList = (user, editKey) => {
  return jsonRequest(
      `${BASE_URL}/user/${user}/event?edit-key=${editKey}`,
    );
}

const str2minutes = (str) => {
  const arr = str.split(":");
  if (arr.length === 1) return str;
  if (arr.length === 2) return Number(arr[0]) + Number(arr[1]) / 60;
  if (arr.length === 3) return Number(arr[0]) * 60 + Number(arr[1]) + Number(arr[2]) / 60;
}

const safeDate = (str) => new Date(str).toISOString().split("T")[0]

export const putEvent = (user, editKey, evt) => {
  const data = {
    date: safeDate(evt.date),
    duration: str2minutes(evt.duration),
    distance: Number(evt.distance),
    calories: Number(evt.calories),
    type: evt.type,
  };
  return jsonRequest(
    `${BASE_URL}/user/${user}/event?edit-key=${editKey}`,
    data,
    'PUT',
  );
}

export const postEvent = (user, id, editKey, evt) => {
  const data = {
    date: safeDate(evt.date),
    duration: str2minutes(evt.duration),
    distance: Number(evt.distance),
    calories: Number(evt.calories),
    type: evt.type,
  };
  return jsonRequest(
    `${BASE_URL}/user/${user}/event/${id}?edit-key=${editKey}`,
    data,
    'POST',
  );
}

export const deleteEvent = (user, id, editKey) => {
  const data = {};
  return jsonRequest(
    `${BASE_URL}/user/${user}/event/${id}?edit-key=${editKey}`,
    data,
    'DELETE',
  );
}

export const getGoals = (user, year, editKey) => {
  return jsonRequest(
      `${BASE_URL}/user/${user}/goal/${year}?edit-key=${editKey}`,
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

export const upsertGoals = (user, year, goals, editKey) => {
  const data = {
    "sum-events": extractNullableGoal(goals, ['sums', 'events']),
    "weekly-dist": extractNullableGoal(goals, ['weekly', 'distance']),
    "route": goals.route,
  };
  return jsonRequest(
    `${BASE_URL}/user/${user}/goal/${year}?edit-key=${editKey}`,
    data,
    'POST',
  );
}

export const registerUser = (user, editKey) => {
  const data = {
    user,
    'edit-key': editKey,
  };
  return jsonRequest(
    `${BASE_URL}/user`,
    data,
    'PUT',
  );
}

export const putRoute = (user, name, waypoints, editKey) => {
  const data = { name, waypoints: waypoints.map(([from, to]) => `${from}|${to}`) };
  return jsonRequest(
    `${BASE_URL}/user/${user}/route?edit-key=${editKey}`,
    data,
    'PUT',
  );
}

export const postRoute = (user, routeId, name, waypoints, editKey) => {
  const data = { name, waypoints: waypoints.map(([from, to]) => `${from}|${to}`) };
  return jsonRequest(
    `${BASE_URL}/user/${user}/route/${routeId}?edit-key=${editKey}`,
    data,
    'POST',
  );
}

export const getUserRouteDesigns = (user, editKey) => {
  return jsonRequest(
    `${BASE_URL}/user/${user}/route?edit-key=${editKey}`,
  );
}

export const getPublicRouteDesigns = () => {
  return jsonRequest(`${BASE_URL}/route`);
}
