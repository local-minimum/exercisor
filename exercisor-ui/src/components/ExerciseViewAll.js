import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
import ExerciseOverviewCharts from './ExerciseOverviewCharts';
import CompensateCalories from './CompensateCalories';
import DoEViewMode from './DistanceOnEarth/ViewMode';
import DoEEditMode from './DistanceOnEarth/EditMode';
import { events2timeSeries, events2weeklySum, filterEvents } from '../util';

export default class ExerciseViewAll extends React.Component {
  getName = () => this.props.match.params.name;

  render() {
    const {
      editKey, onLoadRoute, routes, goals, locations, editKeyDidChange,
      onMakeRoute, onLoadRouteDesigns, userRouteDesigns, publicRouteDesigns,
      consideredRouteDesign, onSetRouteDesignConsidered, onSetSelectedRoute,
      onUpdateRoute, error, eventTypeFilters,
    } = this.props;
    const events = filterEvents(this.props.events, null, eventTypeFilters);
    const series = events2timeSeries(events);
    const weeklySeries = events2weeklySum(events);
    const DistanceOnEarth = editKey.length > 0 ?
      <DoEEditMode
        routesData={routes}
        locations={locations}
        routeId={consideredRouteDesign == null ? goals && goals.route : consideredRouteDesign}
        year="total"
        ownRouteDesigns={userRouteDesigns}
        allRouteDesigns={publicRouteDesigns}
        onLoadRoute={onLoadRoute}
        onMakeRoute={onMakeRoute}
        onUpdateRoute={onUpdateRoute}
        onLoadRouteDesigns={onLoadRouteDesigns}
        onSetRouteDesignConsidered={onSetRouteDesignConsidered}
        onSetSelectedRoute={onSetSelectedRoute}
        editKey={editKey}
        editKeyDidChange={editKeyDidChange}
        error={error}
      /> :
      <DoEViewMode
        events={events}
        onLoadRoute={onLoadRoute}
        routesData={routes}
        routeId={goals && goals.route} year="total"
        ownRouteDesigns={userRouteDesigns}
        allRouteDesigns={publicRouteDesigns}
        onLoadRouteDesigns={onLoadRouteDesigns}
        error={error}
      />
    return (
      <div>
        <ExerciseSummary events={events} />
        <ExerciseTable {...this.props} events={events} />
        {DistanceOnEarth}
        <CompensateCalories events={events} />
        <ExerciseOverviewCharts series={series} weeklySeries={weeklySeries} />
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
