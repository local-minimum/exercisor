import { combineReducers } from 'redux';
import {
  SET_NAME, SET_EVENTS, SET_YEARS,
  SET_ENTRY_DATE, SET_ENTRY_DURATION, SET_ENTRY_DISTANCE, SET_ENTRY_CALORIES, CLEAR_ENTRY,
  SET_EDITKEY, SET_ENTRY, SETTING_LISTALL,
} from './actions';

const defaultSettings = {listAll: false};
const settings = (state = defaultSettings, action) => {
  switch (action.type) {
    case SETTING_LISTALL:
      return Object.assign({}, state, {listAll: action.value});
    default:
      return state;
  }
};

const defaultEntry = {date: "", distance: "", duration: "", calories: "", id: null};

const entry = (state = defaultEntry, action) => {
  switch (action.type) {
    case SET_ENTRY:
      return {
        id: action.entry.id,
        date: action.entry.date == null ? "": action.entry.date,
        distance: action.entry.distance == null ? "" : action.entry.distance.toString(),
        duration: action.entry.duration == null ? "" : action.entry.duration.toString(),
        calories: action.entry.calories == null ? "" : action.entry.calories.toString(),
      };
    case SET_ENTRY_DATE:
      return Object.assign({}, state, {date: action.date});
    case SET_ENTRY_DURATION:
      return Object.assign({}, state, {duration: action.duration});
    case SET_ENTRY_DISTANCE:
      return Object.assign({}, state, {distance: action.distance});
    case SET_ENTRY_CALORIES:
      return Object.assign({}, state, {calories: action.calories});
    case CLEAR_ENTRY:
      return defaultEntry;
    default:
      return state;
  }
}

const editKey = (state = "", action) => {
  switch (action.type) {
    case SET_EDITKEY:
      return action.key;
    default:
      return state;
  }

}

const name = (state = null, action) => {
  switch (action.type) {
    case SET_NAME:
      return action.name;
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

const years = (state = {}, action) => {
  switch (action.type) {
    case SET_YEARS:
      return action.years;
    default:
      return state;
  }
}

export default combineReducers({
  name, events, years, entry, editKey, settings,
});
