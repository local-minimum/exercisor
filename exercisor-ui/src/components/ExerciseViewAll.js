import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
import ExerciseOverviewCharts from './ExerciseOverviewCharts';
import CompensateCalories from './CompensateCalories';
import DistanceOnEarth from './DistanceOnEarth';
import { events2timeSeries, events2convTimeSeries } from '../util';

export default function ExerciseViewAll(props) {
  const { events, onLoadRoute } = props;
  const series = events2timeSeries(events);
  const convSeries = events2convTimeSeries(events);
  return (
    <div>
      <ExerciseSummary events={events} />
      <ExerciseTable {...props} />
      <ExerciseOverviewCharts series={series} convSeries={convSeries} />
      <CompensateCalories events={events} />
      <DistanceOnEarth events={events} onLoadRoute={onLoadRoute} />
    </div>
  );
}
