import $ from 'jquery';

const BASE_URL = '/exercisor/api';

export const getUserEventList = (user, editKey) => {
  return $
    .getJSON(`${BASE_URL}/${user}/event?edit-key=${editKey}`);
}

const ajaxErrorHandler = ({ responseJSON = {}, statusText }) => {
  const message = responseJSON.message || statusText;
  return Promise.reject(Error(message));
}

const jsonRequest = (url, data, type='POST') => {
  return $.ajax({
    type,
    url,
    contentType: 'application/json',
    data: JSON.stringify(data),
    dataType: 'json',
  })
    .catch(ajaxErrorHandler);
}


const str2minutes = (str) => {
  const arr = str.split(":");
  if (arr.length === 1) return str;
  return Number(arr[0]) + Number(arr[1]) / 60;
}

export const putEvent = (user, editKey, evt) => {
  const data = {
    date: evt.date,
    duration: str2minutes(evt.duration),
    distance: Number(evt.distance),
    calories: Number(evt.calories),
    type: evt.type,
  };
  return jsonRequest(
    `${BASE_URL}/${user}/event?edit-key=${editKey}`,
    data,
    'PUT',
  );
}

export const postEvent = (user, id, editKey, evt) => {
  const data = {
    date: evt.date,
    duration: str2minutes(evt.duration),
    distance: Number(evt.distance),
    calories: Number(evt.calories),
    type: evt.type,
  };
  return jsonRequest(
    `${BASE_URL}/${user}/event/${id}?edit-key=${editKey}`,
    data,
    'POST',
  );
}

export const deleteEvent = (user, id, editKey) => {
  const data = {};
  return jsonRequest(
    `${BASE_URL}/${user}/event/${id}?edit-key=${editKey}`,
    data,
    'DELETE',
  );
}

export const getGoals = (user, year, editKey) => {
  return $
    .getJSON(`${BASE_URL}/${user}/goal/${year}?edit-key=${editKey}`);
}

export const upsertGoals = (user, year, goals, editKey) => {
  const sums = goals && goals.sums;
  const data = {
    "sum-events": sums && sums.events,
  };
  return jsonRequest(
    `${BASE_URL}/${user}/goal/${year}?edit-key=${editKey}`,
    data,
    'POST',
  );
}
