import { TimeSeries } from "pondjs";

export const date2year = (date) => Number(date.split("-")[0])

export const date2time = (date) => new Date(date).getTime()

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

const calcLoad = (arr, lb, ub, range, rest) => {
  const factor = rest / range;
  let duration = 0;
  let distance = 0;
  let calories = 0;
  arr.forEach(evt => {
    if (evt.time >= lb && evt.time <= ub) {
      duration += evt.duration;
      distance += evt.distance;
      calories += evt.calories;
    }
  });
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
  const aDay = 1000 * 60 * 60 * 24;
  const span = 15 * aDay;
  if (rawEvents.length > 0) {
    const nullLoad = { distance: null, duration: null, calories: null};
    let prevTime = null;
    rawEvents.forEach(({time}) => {
      const date = new Date(time);
      const low = time - span;
      const high = time - aDay;
      const range = (high - low) / aDay + 1;
      const leadingRest = prevTime == null ? 0 : Math.min(3, (time - prevTime) / aDay);
      const curLoad = calcLoad(rawEvents, low, high, range, leadingRest);
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
