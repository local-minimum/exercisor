import { combineReducers } from 'redux';
import { SET_NAME, SET_EVENTS } from './actions';

const dummy = (state = [], action ) => {
  switch (action.type) {
    default:
      return state;
  }
};

const name = (state = null, action) => {
  switch (action.type) {
    case SET_NAME:
      return action.name
    default:
      return state;
  }
}

const events = (state = [], action) => {
  switch (action.type) {
    case SET_EVENTS:
      return action.events;
    default:
      return state;
  }
}

export default combineReducers({
  dummy, name, events,
});
