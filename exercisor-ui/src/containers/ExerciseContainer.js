import { connect } from 'react-redux';
import ExerciseView from '../components/ExerciseView';
import {
  loadEvents, saveEvent, removeEvent, loadYearGoals, saveGoals, loadRoute,
  makeRoute, loadRouteDesigns, saveSelectedRoute, updateRoute,
} from '../redux/thunks';
import {
  setEntryDate, setEntryCalories, setEntryDistance, setEntryDuration,
  setEntry, settingListAll, setGoalsEventSum, setEntryType, setYear,
  setGoalsWeeklyDist, setRouteDesignConsidered, setEventTypeFilter,
} from '../redux/actions';

const mapStateToProps = (state, ownProps) => ({
  goals: state.goals,
  settings: state.settings,
  editKey: state.editKey,
  entry: state.entry,
  events: state.events,
  name: ownProps.match.params.name,
  year: state.year,
  years: state.years,
  userOutOfSync: ownProps.match.params.name !== state.name && state.name != null,
  locations: state.locations,
  routes: state.routes,
  error: state.error,
  userRouteDesigns: state.userRouteDesigns,
  publicRouteDesigns: state.publicRouteDesigns,
  consideredRouteDesign: state.consideredRouteDesign,
  eventTypeFilters: state.eventTypeFilters,
  exerciseViewChange: state.exerciseViewChange,
});

const mapDispatchToProps = dispatch => ({
  onReloadUser: user => dispatch(loadEvents(user)),
  onEntryDate: date => dispatch(setEntryDate(date)),
  onEntryDuration: duration => dispatch(setEntryDuration(duration)),
  onEntryDistance: distance => dispatch(setEntryDistance(distance)),
  onEntryCalories: calories => dispatch(setEntryCalories(calories)),
  onEntryType: type => dispatch(setEntryType(type)),
  onSave: () => dispatch(saveEvent()),
  onSetEntry: entry => dispatch(setEntry(entry)),
  onRemoveEntry: entryId => dispatch(removeEvent(entryId)),
  onListAll: value => dispatch(settingListAll(value)),
  onChangeYear: year => dispatch(setYear(year)),
  onLoadGoals: (user, year) => dispatch(loadYearGoals(user, year)),
  onSetGoalsEventSum: events => dispatch(setGoalsEventSum(events)),
  onSetGoalsDistanceWeekly: dist => dispatch(setGoalsWeeklyDist(dist)),
  onSaveGoals : (user, year) => dispatch(saveGoals(user, year)),
  onLoadRoute : (from, to) => dispatch(loadRoute(from, to)),
  onMakeRoute: (routeName, waypoints) => dispatch(makeRoute(routeName, waypoints)),
  onUpdateRoute: (routeId, routeName, waypoints) => dispatch(updateRoute(routeId, routeName, waypoints)),
  onLoadRouteDesigns: () => dispatch(loadRouteDesigns()),
  onSetRouteDesignConsidered: (routeId) => dispatch(setRouteDesignConsidered(routeId)),
  onSetSelectedRoute: (routeId, year) => dispatch(saveSelectedRoute(routeId, year)),
  onSetEventTypeFilter: (status, name) => dispatch(setEventTypeFilter(name, status)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExerciseView);
