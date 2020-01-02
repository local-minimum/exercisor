import { setName, setEvents, setYears, clearEntry } from './actions';
import { getUserList, putEvent, postEvent, deleteEvent } from '../apigateway';

function yearCount(events) {
    const count = {}
    const year = evt => Number(evt.date.split("-")[0])
    const inc = year => {
      if (count[year] == null) count[year] = 0
      count[year] += 1;
    }
    events.forEach(evt => inc(year(evt)))
    return count;
}

export function loadEvents(name, year) {
  return (dispatch, getState) => {
    dispatch(setName(name));
    return getUserList(name)
      .then(events => {
        if (year == null) {
          dispatch(setYears(yearCount(events)));
        }
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
            dispatch(loadEvents(name, null));
        });
    }
    return postEvent(name, entry.id, editKey, entry)
        .then(res => {
            dispatch(loadEvents(name, null));
        });
  }
}

export function removeEvent(evtId) {
  return (dispatch, getState) => {
    const { name, editKey } = getState();
    return deleteEvent(name, evtId, editKey)
      .then(res => {
        dispatch(loadEvents(name, null));
      });
  }
}
