import { setName, setEvents, setYears, clearEntry, setGoals } from './actions';
import {
  getUserEventList, putEvent, postEvent, deleteEvent, getGoals, upsertGoals,
} from '../apigateway';
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
        });
    }
  }
}

export function saveGoals(name, year) {
  return (dispatch, getState) => {
    const { goals, editKey } = getState();
    if (goals != null) {
      upsertGoals(name, year, goals, editKey)
        .then(_ => dispatch(loadYearGoals(name, year)));
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
      });
  }
}

export function saveEvent() {
  return (dispatch, getState) => {
    const {entry, name, editKey} = getState();
    dispatch(clearEntry());
    if (entry.id == null) {
      return putEvent(name, editKey, entry)
        .then(res => {
            dispatch(loadEvents(name));
        });
    }
    return postEvent(name, entry.id, editKey, entry)
        .then(res => {
            dispatch(loadEvents(name));
        });
  }
}

export function removeEvent(evtId) {
  return (dispatch, getState) => {
    const { name, editKey } = getState();
    return deleteEvent(name, evtId, editKey)
      .then(res => {
        dispatch(loadEvents(name));
      });
  }
}
