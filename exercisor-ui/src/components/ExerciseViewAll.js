import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
import ExerciseOverviewCharts from './ExerciseOverviewCharts';
import { events2timeSeries } from '../util';

export default function ExerciseViewAll(props) {
  const { events } = props;
  const series = events2timeSeries(events);
  return (
    <div>
      <ExerciseSummary events={events} />
      <ExerciseTable {...props} />
      <ExerciseOverviewCharts series={series} />
    </div>
  );
}
