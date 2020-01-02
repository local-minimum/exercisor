import jQuery from 'jQuery';

BASE_URL = '//exercisor/api';
BASE_PORT = 8081

const get_user_list = (user, editKey) => {
  return jQuery
    .getJSON(`${BASE_URL}/${user}?edit-key=${editKey}`);
}
