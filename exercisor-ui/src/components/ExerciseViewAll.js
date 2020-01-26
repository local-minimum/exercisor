import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
import ExerciseOverviewCharts from './ExerciseOverviewCharts';
import CompensateCalories from './CompensateCalories';
import DoEViewMode from './DistanceOnEarth/ViewMode';
import DoEEditMode from './DistanceOnEarth/EditMode';
import { events2timeSeries, events2convTimeSeries } from '../util';

export default class ExerciseViewAll extends React.Component {
  getName = () => this.props.match.params.name;

  render() {
    const { editKey, events, onLoadRoute, routes, goals, locations } = this.props;
    const series = events2timeSeries(events);
    const convSeries = events2convTimeSeries(events);
    const DistanceOnEarth = editKey.length > 0 ?
      <DoEEditMode
        routesData={routes}
        locations={locations}
        routeId={goals && goals.route}
        year="total"
        ownRouteDesigns={[]}
        allRouteDesigns={[]}
        onLoadRoute={onLoadRoute}
      />
      : <DoEViewMode events={events} onLoadRoute={onLoadRoute} routesData={routes} routeId={goals && goals.route} year="total"/>
    return (
      <div>
        <ExerciseSummary events={events} />
        <ExerciseTable {...this.props} />
        {DistanceOnEarth}
        <CompensateCalories events={events} />
        <ExerciseOverviewCharts series={series} convSeries={convSeries} />
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
