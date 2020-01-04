import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
import ExerciseOverviewCharts from './ExerciseOverviewCharts';
import CompensateCalories from './CompensateCalories';
import { events2timeSeries, events2convTimeSeries } from '../util';

export default function ExerciseViewAll(props) {
  const { events } = props;
  const series = events2timeSeries(events);
  const convSeries = events2convTimeSeries(events);
  return (
    <div>
      <ExerciseSummary events={events} />
      <ExerciseTable {...props} />
      <ExerciseOverviewCharts series={series} convSeries={convSeries} />
      <CompensateCalories events={events} />
    </div>
  );
}
