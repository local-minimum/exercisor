import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
import { filterEvents } from '../util';
import ExerciseOverviewCharts from './ExerciseOverviewCharts';
import { events2timeSeries } from '../util';

export default function ExerciseViewYear(props) {
  const locArr = props.location.pathname.split('/');
  const year = locArr[locArr.indexOf(props.match.params.name) + 1];
  const events = filterEvents(props.events, year != null ? Number(year) : null);
  const series = events2timeSeries(events);
  return (
    <div>
      <ExerciseSummary events={events} year={year} />
      <ExerciseTable {...props} events={events} />
      <ExerciseOverviewCharts series={series} />
    </div>
  );
}
