import $ from 'jquery';

const BASE_URL = '/exercisor/api';

export const getUserList = (user, editKey) => {
  return $
    .getJSON(`${BASE_URL}/${user}?edit-key=${editKey}`);
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
  };
  return jsonRequest(
    `${BASE_URL}/${user}?edit-key=${editKey}`,
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
  };
  return jsonRequest(
    `${BASE_URL}/${user}/${id}?edit-key=${editKey}`,
    data,
    'POST',
  );
}

export const deleteEvent = (user, id, editKey) => {
  const data = {};
  return jsonRequest(
    `${BASE_URL}/${user}/${id}?edit-key=${editKey}`,
    data,
    'DELETE',
  );
}
