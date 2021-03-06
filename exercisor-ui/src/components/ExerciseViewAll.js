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
      onLoadRoute, routes, goals, locations,
      onMakeRoute, userRouteDesigns, publicRouteDesigns,
      consideredRouteDesign, onSetRouteDesignConsidered, onSetSelectedRoute,
      onUpdateRoute, error, eventTypeFilters, editMode,
    } = this.props;
    const events = filterEvents(this.props.events, null, eventTypeFilters);
    const series = events2timeSeries(events);
    const weeklySeries = events2weeklySum(events);
    const DistanceOnEarth = editMode ?
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
        onSetRouteDesignConsidered={onSetRouteDesignConsidered}
        onSetSelectedRoute={onSetSelectedRoute}
        error={error}
      /> :
      <DoEViewMode
        events={events}
        onLoadRoute={onLoadRoute}
        routesData={routes}
        routeId={goals && goals.route}
        year="total"
        ownRouteDesigns={userRouteDesigns}
        allRouteDesigns={publicRouteDesigns}
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
    const { onLoadGoals, name } = this.props;
    if (name != null) onLoadGoals(this.getName(), "total");
  }

  componentDidUpdate() {
    const { onLoadGoals, exerciseViewChange, onChangeYear, year, goals, name } = this.props;
    if (exerciseViewChange && name != null) {
      if (year != null) onChangeYear(null);
      if (goals != null && Number.isFinite(Number(goals.year))) onLoadGoals(this.getName(), "total");
    }
  }
}
