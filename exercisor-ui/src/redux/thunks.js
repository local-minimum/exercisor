import { setName, setEvents } from './actions';
import { getUserList } from '../apigateway';

export function loadEvents(name, year) {
  return (dispatch, getState) => {
    dispatch(setName(name));
    return getUserList(name)
      .then(events => dispatch(setEvents(events)));
  }
}
