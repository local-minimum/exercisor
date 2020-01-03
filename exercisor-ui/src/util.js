import { TimeSeries } from "pondjs";

export const date2year = (date) => Number(date.split("-")[0])

export const date2time = (date) => new Date(date).getTime()

export const filterEvents = (events, year) => {
  if (year == null) return events;
  return events.filter(evt => date2year(evt.date) === year);
}

export const events2timeSeries = (events) => {
  console.log(events);
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
