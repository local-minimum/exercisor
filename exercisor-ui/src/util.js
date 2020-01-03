export const date2year = (date) => Number(date.split("-")[0])

export const filterEvents = (events, match) => {
  const year = match.params.year;
  if (year == null) return events;
  return events.filter(evt => date2year(evt.date) === year);
}
