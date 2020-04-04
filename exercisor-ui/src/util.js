import $ from 'jquery';
import { TimeSeries, sum, filter } from "pondjs";

export const switchUser = (fromUser, toUser, history) => {
    const pos = history.location.pathname.search(fromUser);
    if (pos < 0) {
      console.error("Unexpected path, figure out where user is");
    }
    const base = history.location.pathname.slice(0, pos);
    if (base === '') {
      history.push(`/${toUser}`);
    } else {
      history.push(`${base}${toUser}`)
    }
}

export const EVENT_TYPES = {
  CrossTrainer: 'CrossTrainer',
  Running: 'Löpning',
  Biking: 'Cykling',
  Walking: 'Prommenad',
  Hiking: 'Vandra',
  Golfing: 'Golf',
};

export const EVENT_ICONS = {
  CrossTrainer: 'crosstrainer',
  Running: 'run',
  Biking: 'bike',
  Walking: null,
  Hiking: null,
  Golfing: null,
}

const ajaxErrorHandler = ({ responseJSON = {}, statusText }) => {
  const message = responseJSON.message || statusText;
  return Promise.reject(message);
}

export const jsonRequest = (url, data={}, type='GET') => {
  return $.ajax(Object.assign({
    type,
    url,
  }, type === 'GET' ? null : {
    contentType: 'application/json',
    data: JSON.stringify(data),
    dataType: 'json',
  }))
    .catch(ajaxErrorHandler);
}

export const emptyOrNull = (val) => val == null || val === '';

export const aDay = 1000 * 60 * 60 * 24;

export const date2year = (date) => Number(date.split("-")[0])

export const date2time = (date) => new Date(date).getTime()

export const getPeriod = (events, year) => {
  let periodStart = 0;
  let periodEnd = 0;
  if (year == null) {
    if (events.length > 0) {
      periodStart = new Date(events[events.length - 1].date).getTime();
      periodEnd = new Date(events[0].date).getTime();
    }
  } else {
    periodStart = new Date(`${year}-01-01`).getTime();
    if (events.length > 0) {
      const firstDate = new Date(events[events.length - 1].date).getTime();
      if ((firstDate - periodStart) / aDay > 10) periodStart = firstDate;
    }
    periodEnd = Math.min(
      new Date(`${year}-12-31`).getTime(),
      new Date().getTime()
    );
  }
  return { start: periodStart, end: periodEnd };
}

export const getPeriodDuration = (events, year) => {
  const period = getPeriod(events, year);
  return Math.floor((period.end - period.start) / aDay) + 1;
}

export const getYearDuration = (year) => {
  const start = new Date(`${year}-01-01`).getTime();
  const end = new Date(`${year}-12-31`).getTime();
  return Math.floor((end - start) / aDay) + 1;
}

export const getYearDurationSoFar = (year) => {
  const start = new Date(`${year}-01-01`).getTime();
  const end = Math.min(
    new Date(`${year}-12-31`).getTime(),
    new Date().getTime()
  );
  return Math.floor((end - start) / aDay) + 1;
}

export const minutes2str = (floatMinutes) => {
    if (floatMinutes == null) return '';
    const hours = Math.floor(floatMinutes / 60);
    const minutes = Math.floor(floatMinutes - 60 * hours);
    const seconds = Math.round((floatMinutes - (minutes + hours * 60)) * 60);
    const zeroPadHours = hours < 10 ? `0${hours}` : hours;
    const zeroPadMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const zeroPadSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${zeroPadHours}:${zeroPadMinutes}:${zeroPadSeconds}`;
}

export const filterEvents = (events, year, evtFilter) => {
  return events
    .filter(evt => year == null || date2year(evt.date) === year)
    .filter(evt => !evtFilter.some(f => f === (evt.type == null ? 'CrossTrainer' : evt.type)))
}

export const events2timeSeries = (events) => {
  const data = {
    columns: ["index", "duration", "distance", "calories", "type"],
    points: events
      .slice()
      .reverse()
      .map(evt => [
        evt.date,
        Number.isFinite(evt.duration) ? evt.duration : null,
        Number.isFinite(evt.distance) ? evt.distance : null,
        Number.isFinite(evt.calories) ? evt.calories : null,
        evt.type == null ? "CrossTrainer" : evt.type,
      ]),
  };
  return new TimeSeries(data);
}

const calcLoad = (arr, lb, ub, rest) => {
  let duration = 0;
  let distance = 0;
  let calories = 0;
  let n = 0
  let firstTime = null;
  let lastTime = null;
  arr.forEach(evt => {
    if (evt.time >= lb && evt.time <= ub) {
      if (firstTime == null) firstTime = evt.time;
      lastTime = evt.time;
      n += 1;
      duration += evt.duration;
      distance += evt.distance;
      calories += evt.calories;
    }
  });
  const avgRest = n === 0 ? 1 : ((lastTime - firstTime) / aDay + 1) / n;
  const factor = (1 + Math.log10(rest)) / (1 + Math.log10(avgRest)) * (n === 0 ? 1 : 1 / n);
  return {
    duration: duration * factor,
    distance: distance * factor,
    calories: calories * factor,
  }
}

export const events2weeklySum = (events, evtFilter) => {
  const ts = events2timeSeries(events);
  return ts.fixedWindowRollup({
    windowSize: '7d',
    aggregation: {
      duration: {duration: sum(filter.ignoreMissing)},
      distance: {distance: sum(filter.ignoreMissing)},
      calories: {calories: sum(filter.ignoreMissing)},
    }
  });
}

export const events2convTimeSeries = (events) => {
  const rawEvents = events.slice().reverse().map(({date, duration, distance, calories}) => ({
    time: new Date(date).getTime(),
    duration, distance, calories,
  }));
  const convEvents = [];
  const span = 22 * aDay;
  if (rawEvents.length > 0) {
    const nullLoad = { distance: null, duration: null, calories: null};
    let prevTime = null;
    rawEvents.forEach(({time}) => {
      const date = new Date(time);
      const low = time - span;
      const high = time - aDay;
      const leadingRest = prevTime == null ? 1 : (time - prevTime) / aDay;
      const curLoad = calcLoad(rawEvents, low, high, leadingRest);
      const load = prevTime == null ? nullLoad : curLoad;
      convEvents.push({
        date: date.toISOString().split("T")[0],
        type: null,
        ...load,
      });
      prevTime = time;
    });
  }
  return events2timeSeries(convEvents.reverse());
}
