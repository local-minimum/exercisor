import $ from 'jquery';

const BASE_URL = '/exercisor/api';

export const getUserList = (user, editKey) => {
  return $
    .getJSON(`${BASE_URL}/${user}?edit-key=${editKey}`);
}
