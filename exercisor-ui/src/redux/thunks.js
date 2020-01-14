import {
  setName, setEvents, setYears, clearEntry, setGoals,
  setOSMLocation, setOSMRoute, setErrorMessage
} from './actions';
import {
  getUserEventList, putEvent, postEvent, deleteEvent, getGoals, upsertGoals,
} from '../apigateway';
import {
  getLocation, getRouteCoordinates,
} from '../osmgateway';
import { aDay } from '../util';

function yearCount(events) {
    const now = new Date()
    const next2Weeks = new Date(now.getTime() + aDay * 14);
    const count = {[now.getFullYear()]: 0, [next2Weeks.getFullYear()]: 0};
    const year = evt => Number(evt.date.split("-")[0])
    const inc = year => {
      if (count[year] == null) count[year] = 0
      count[year] += 1;
    }
    events.forEach(evt => inc(year(evt)))
    return count;
}

export function loadYearGoals(name, year) {
  return (dispatch, getState) => {
    const { goals, editKey } = getState();
    const invalid = goals == null || goals.user !== name || goals.year !== Number(year);
    if (invalid) {
      return getGoals(name, year, editKey)
        .then(goals => {
          if (goals == null) {
            dispatch(setGoals({
              fake: true,
              year: Number(year),
              user: name,
              sums: {events: 0}}));
          } else {
            dispatch(setGoals(goals));
          }
        })
        .catch(message => dispatch(setErrorMessage(message)));
    }
  }
}

export function saveGoals(name, year) {
  return (dispatch, getState) => {
    const { goals, editKey } = getState();
    if (goals != null) {
      upsertGoals(name, year, goals, editKey)
        .then(_ => dispatch(loadYearGoals(name, year)))
        .catch(message => dispatch(setErrorMessage(message)));
    }
  }
}

export function loadEvents(name) {
  return (dispatch, getState) => {
    const { editKey } = getState();
    dispatch(setName(name));
    return getUserEventList(name, editKey)
      .then(events => {
        dispatch(setYears(yearCount(events)));
        dispatch(setEvents(events))
      })
      .catch(message => dispatch(setErrorMessage(message)));
  }
}

export function saveEvent() {
  return (dispatch, getState) => {
    const {entry, name, editKey} = getState();
    const {date} = entry;
    dispatch(clearEntry());
    if (entry.id == null) {
      return putEvent(name, editKey, entry)
        .then(res => {
            dispatch(loadEvents(name));
        })
        .catch(message => dispatch(setErrorMessage(message)));

    }
    return postEvent(name, entry.id, editKey, entry)
        .then(res => {
            dispatch(loadEvents(name));
        })
        .catch(message => dispatch(setErrorMessage(message)));
  }
}

export function removeEvent(evtId) {
  return (dispatch, getState) => {
    const { name, editKey } = getState();
    return deleteEvent(name, evtId, editKey)
      .then(res => {
        dispatch(loadEvents(name));
      })
      .catch(message => dispatch(setErrorMessage(message)));
  }
}

function getOSMLocationCoords(state, locationName) {
  if (state.locations == null) return null;
  const location = state.locations[locationName];
  if (location == null) return null;
  return {lat: location.lat, lon: location.lon};
}

function getOSMRouteCoords(state, fromName, toName) {
  if (state.routes == null) return null;
  const fromRoutes = state.routes[fromName];
  if (fromRoutes == null) return null;
  return fromRoutes[toName];
}

export function loadRoute(from, to) {
  return (dispatch, getState) => {
    const route = getOSMRouteCoords(getState(), from, to);
    if (route != null) return Promise.resolve(route);
    const locationPromises = [];
    const knownFrom = getOSMLocationCoords(getState(), from);
    if (knownFrom == null) {
      locationPromises.push(
        getLocation(from)
          .then(coords => dispatch(setOSMLocation(from, coords)))
          .catch(message => dispatch(setErrorMessage(message)))
      );
    }
    const knownTo = getOSMLocationCoords(getState(), to);
    if (knownTo == null) {
      locationPromises.push(
        getLocation(to)
          .then(coords => dispatch(setOSMLocation(to, coords)))
          .catch(message => dispatch(setErrorMessage(message)))
      );
    }
    return Promise.all(locationPromises)
      .then(() => {
          const fromLoc = getOSMLocationCoords(getState(), from);
          const toLoc = getOSMLocationCoords(getState(), to);
          getRouteCoordinates(fromLoc, toLoc)
            .then(route => {
              dispatch(setOSMRoute(from, to, route));
            })
            .catch(message => dispatch(setErrorMessage(message)));
      });
  };
}
