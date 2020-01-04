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

const conv = (arr, lb, ub, range) => {
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
    duration: duration / range,
    distance: distance / range,
    calories: calories / range,
  }
}

export const events2convTimeSeries = (events) => {
  const rawEvents = events.slice().reverse().map(({date, duration, distance, calories}) => ({
    time: new Date(date).getTime(),
    duration, distance, calories,
  }));
  const convEvents = [];
  const aDay = 1000 * 60 * 60 * 24;
  const span = 3 * aDay;
  if (rawEvents.length > 0) {
    const rangeStart = rawEvents[0].time
    const rangeEnd = rawEvents[rawEvents.length - 1].time
    for (let now = rangeStart; now <= rangeEnd; now += aDay) {
      const date = new Date(now);
      const low = Math.max(rangeStart, now - span);
      const high = Math.min(rangeEnd, now + span);
      const range = (high - low) / aDay + 1;
      convEvents.push({
        date: date.toISOString().split("T")[0],
        type: null,
        ...conv(rawEvents, low, high, range),
      })
    }
  }
  return events2timeSeries(convEvents.reverse());
}
