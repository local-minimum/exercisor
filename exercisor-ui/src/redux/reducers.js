import { combineReducers } from 'redux';
import {
  SET_NAME, SET_EVENTS, SET_YEARS,
  SET_ENTRY_DATE, SET_ENTRY_DURATION, SET_ENTRY_DISTANCE, SET_ENTRY_CALORIES, CLEAR_ENTRY,
  SET_EDITKEY, SET_ENTRY, SETTING_LISTALL, SET_GOALS, SET_GOALS_EVENTSSUM,
  SET_OSM_ROUTE, SET_OSM_LOCATION, SET_ENTRY_TYPE, SET_ERROR_MESSAGE,
  SET_REG_USER, SET_REG_PWD, SET_REG_PWD2, SET_GOALS_WEEKLYDIST,
  SET_ROUTE_DESIGNS_USER, SET_ROUTE_DESIGNS_PUBLIC, SET_ROUTE_DESIGN_CONSIDERED,
} from './actions';
import { minutes2str } from '../util';

const defaultSettings = {listAll: false};
const settings = (state = defaultSettings, action) => {
  switch (action.type) {
    case SETTING_LISTALL:
      return Object.assign({}, state, {listAll: action.value});
    default:
      return state;
  }
};

const defaultEntry = {
  date: "",
  distance: "",
  duration: "",
  calories: "",
  id: null,
  type: "CrossTrainer",
};

const entry = (state = defaultEntry, action) => {
  switch (action.type) {
    case SET_ENTRY:
      return {
        id: action.entry.id,
        date: action.entry.date == null ? "": action.entry.date,
        distance: action.entry.distance == null ? "" : action.entry.distance.toString(),
        duration: action.entry.duration == null ? "" : minutes2str(action.entry.duration),
        calories: action.entry.calories == null ? "" : action.entry.calories.toString(),
        type: action.entry.type == null ? "CrossTrainer" : action.entry.type,
      };
    case SET_ENTRY_DATE:
      return Object.assign({}, state, {date: action.date});
    case SET_ENTRY_DURATION:
      return Object.assign({}, state, {duration: action.duration});
    case SET_ENTRY_DISTANCE:
      return Object.assign({}, state, {distance: action.distance});
    case SET_ENTRY_CALORIES:
      return Object.assign({}, state, {calories: action.calories});
    case SET_ENTRY_TYPE:
      return Object.assign({}, state, {type: action.eventType});
    case SET_NAME:
    case CLEAR_ENTRY:
      return defaultEntry;
    default:
      return state;
  }
}

const editKey = (state = "", action) => {
  switch (action.type) {
    case SET_NAME:
      return "";
    case SET_EDITKEY:
      return action.key;
    default:
      return state;
  }
}

const editKeyDidChange = (state = true, action) => {
  switch (action.type) {
    case SET_NAME:
    case SET_EDITKEY:
      return true;
    default:
      return false;
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
    case SET_NAME:
      return [];
    case SET_EVENTS:
      return action.events;
    default:
      return state;
  }
}

const years = (state = {}, action) => {
  switch (action.type) {
    case SET_NAME:
      return {};
    case SET_YEARS:
      return action.years;
    default:
      return state;
  }
}

const goals = (state = null, action) => {
  switch (action.type) {
    case SET_NAME:
    case SET_YEARS:
      return {};
    case SET_GOALS_EVENTSSUM:
      return Object.assign(
        {},
        state,
        {sums: Object.assign(
          {events: ''},
          state && state.sums,
          {events: action.events}
        )},
      );
    case SET_GOALS_WEEKLYDIST:
      return Object.assign(
        {},
        state,
        {weekly: Object.assign(
          {distance: ''},
          state && state.weekly,
          {distance: action.distance}
        )},
      );
    case SET_GOALS:
      return action.goals;
    default:
      return state;
  }
}

const locations = (state = {}, action) => {
  switch (action.type) {
    case SET_OSM_LOCATION:
      return Object.assign({}, state, {[action.location]: action.coords});
    default:
      return state;
  }
}

const routes = (state = {}, action) => {
  switch (action.type) {
    case SET_OSM_ROUTE:
      return Object.assign(
        {},
        state,
        {[action.from]: Object.assign(
          {},
          state[action.from],
          {[action.to]: action.route},
        )},
      );
    default:
      return state;
  }
}

const error = (state = null, action) => {
  switch (action.type) {
    case SET_NAME:
    case SET_YEARS:
    case SET_GOALS:
    case SET_EVENTS:
    case SET_EDITKEY:
      return null;
    case SET_ERROR_MESSAGE:
      const msg = typeof(action.message) === 'object' ? Object
        .entries(action.message)
        .reduce(
          (acc, [key, val]) =>
            acc == null ? `${key}: ${val}` : `${acc}, ${key}: ${val}`,
          null
        ) : action.message;
      return { message: msg, target: action.target };
    default:
      return state;
  }
}

const defaultReg = {user: '', pwd: '', pwd2: ''};
const register = (state = defaultReg, action) => {
    switch (action.type) {
      case SET_NAME:
        return defaultReg;
      case SET_REG_USER:
        return Object.assign({}, state, {user: action.user.toLocaleLowerCase()});
      case SET_REG_PWD:
        return Object.assign({}, state, {pwd: action.pwd});
      case SET_REG_PWD2:
        return Object.assign({}, state, {pwd2: action.pwd2});
      default:
        return state;

    }
}

const userRouteDesigns = (state = [], action) => {
  switch (action.type) {
    case SET_NAME:
      return [];
    case SET_ROUTE_DESIGNS_USER:
      return action.designs;
    default:
      return state;
  }
}

const publicRouteDesigns = (state = [], action) => {
  switch (action.type) {
    case SET_ROUTE_DESIGNS_PUBLIC:
      return action.designs;
    default:
      return state;
  }
}

const consideredRouteDesign = (state = null, action) => {
  switch (action.type) {
    case SET_NAME:
    case SET_EDITKEY:
    case SET_GOALS:
      return null;
    case SET_ROUTE_DESIGN_CONSIDERED:
      return action.routeId;
    default:
      return state;
  }
}

export default combineReducers({
  name, events, years, entry, editKey, settings, goals, locations, routes,
  error, register, userRouteDesigns, publicRouteDesigns, consideredRouteDesign,
  editKeyDidChange,
});
