import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
import ExerciseOverviewCharts from './ExerciseOverviewCharts';
import CompensateCalories from './CompensateCalories';
import DistanceOnEarth from './DistanceOnEarth';
import { events2timeSeries, events2convTimeSeries } from '../util';

export default class ExerciseViewAll extends React.Component {
  getName = () => this.props.match.params.name;

  render() {
    const { events, onLoadRoute, routes, goals } = this.props;
    const series = events2timeSeries(events);
    const convSeries = events2convTimeSeries(events);
    return (
      <div>
        <ExerciseSummary events={events} />
        <ExerciseTable {...this.props} />
        <ExerciseOverviewCharts series={series} convSeries={convSeries} />
        <CompensateCalories events={events} />
        <DistanceOnEarth events={events} onLoadRoute={onLoadRoute} routes={routes} routeId={goals && goals.route} />
      </div>
    );
  }

  componentDidMount() {
    const { onLoadGoals } = this.props;
    onLoadGoals(this.getName(), "total");
  }

  componentDidUpdate() {
    const { onLoadGoals, goals } = this.props;
    if (goals == null || goals.year !== "total") onLoadGoals(this.getName(), "total");
  }
}
