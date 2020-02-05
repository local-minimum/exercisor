import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
import { filterEvents } from '../util';
import ExerciseOverviewCharts from './ExerciseOverviewCharts';
import YearGoalsEdit from './YearGoalsEdit';
import YearGoals from './YearGoals';
import CompensateCalories from './CompensateCalories';
import DoEViewMode from './DistanceOnEarth/ViewMode';
import DoEEditMode from './DistanceOnEarth/EditMode';
import { events2timeSeries, events2weeklySum } from '../util';

export default class ExerciseViewYear extends React.Component {
  getYear = () => {
    const { location, match } = this.props;
    const locArr = location.pathname.split('/');
    return locArr[locArr.indexOf(match.params.name) + 1];
  }

  getName = () => this.props.match.params.name;

  render() {
    const {
      editKey, goals, onSetGoalsEventSum, onSaveGoals, onLoadRoute, routes,
      onSetGoalsDistanceWeekly, locations, consideredRouteDesign,
      userRouteDesigns, publicRouteDesigns, onLoadRouteDesigns,
      onMakeRoute, onSetRouteDesignConsidered, onSetSelectedRoute, error,
      eventTypeFilters,
    } = this.props;
    const year = this.getYear();
    const events = filterEvents(
      this.props.events, year != null ? Number(year) : null,
      eventTypeFilters,
    );
    const series = events2timeSeries(events);
    const weeklySeries = events2weeklySum(events);
    const Goals = editKey.length > 0 ? <YearGoalsEdit
      year={year}
      goals={goals}
      onSetGoalsEventSum={onSetGoalsEventSum}
      onSetGoalsDistanceWeekly={onSetGoalsDistanceWeekly}
      onSaveGoals={onSaveGoals}
      name={this.getName()}
      error={error}
    /> : <YearGoals year={year} goals={goals} events={events} error={error} />;
    const DistanceOnEarth = editKey.length > 0 ?
      <DoEEditMode
        routesData={routes}
        locations={locations}
        routeId={consideredRouteDesign == null ? goals && goals.route : consideredRouteDesign}
        year={year}
        ownRouteDesigns={userRouteDesigns}
        allRouteDesigns={publicRouteDesigns}
        onLoadRoute={onLoadRoute}
        onMakeRoute={onMakeRoute}
        onLoadRouteDesigns={onLoadRouteDesigns}
        onSetRouteDesignConsidered={onSetRouteDesignConsidered}
        onSetSelectedRoute={onSetSelectedRoute}
        editKey={editKey}
        error={error}
      /> :
      <DoEViewMode
        events={events}
        onLoadRoute={onLoadRoute}
        routesData={routes}
        routeId={goals && goals.route}
        year={year}
        ownRouteDesigns={userRouteDesigns}
        allRouteDesigns={publicRouteDesigns}
        onLoadRouteDesigns={onLoadRouteDesigns}
        error={error}
      />
    return (
      <div>
        <ExerciseSummary events={events} year={year} />
        {Goals}
        <ExerciseTable {...this.props} events={events} />
        {DistanceOnEarth}
        <CompensateCalories events={events} />
        <ExerciseOverviewCharts series={series} weeklySeries={weeklySeries} />
      </div>
    );
  }

  componentDidMount() {
    const year = this.getYear();
    const { onLoadGoals } = this.props;
    onLoadGoals(this.getName(), year);
  }

  componentDidUpdate() {
    const year = this.getYear();
    const { onLoadGoals, goals } = this.props;
    if (goals == null || goals.year !== Number(year)) onLoadGoals(this.getName(), year);
  }
}
