import { TimeSeries } from "pondjs";

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
    const hours = Math.floor(floatMinutes / 60);
    const minutes = Math.floor(floatMinutes - 60 * hours);
    const seconds = Math.round((floatMinutes - (minutes + hours * 60)) * 60);
    const zeroPadHours = hours < 10 ? `0${hours}` : hours;
    const zeroPadMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const zeroPadSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${zeroPadHours}:${zeroPadMinutes}:${zeroPadSeconds}`;
}

export const filterEvents = (events, year) => {
  if (year == null) return events;
  return events.filter(evt => date2year(evt.date) === year);
}

export const events2timeSeries = (events) => {
  const data = {
    columns: ["index", "duration", "distance", "calories", "type"],
    points: events.slice().reverse().map(evt => [
      evt.date,
      evt.duration,
      evt.distance,
      evt.calories,
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
