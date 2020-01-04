import { TimeSeries } from "pondjs";

export const aDay = 1000 * 60 * 60 * 24;

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

const calcLoad = (arr, lb, ub, rest) => {
  let duration = 0;
  let distance = 0;
  let calories = 0;
  let n = 0
  arr.forEach(evt => {
    if (evt.time >= lb && evt.time <= ub) {
      n += 1;
      duration += evt.duration;
      distance += evt.distance;
      calories += evt.calories;
    }
  });
  const factor = rest * (n === 0 ? 1 : 1 / n);
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
  const span = 15 * aDay;
  if (rawEvents.length > 0) {
    const nullLoad = { distance: null, duration: null, calories: null};
    let prevTime = null;
    rawEvents.forEach(({time}) => {
      const date = new Date(time);
      const low = time - span;
      const high = time - aDay;
      const leadingRest = prevTime == null ? 1 : Math.log(Math.min(4, (time - prevTime) / aDay)) + 1;
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
