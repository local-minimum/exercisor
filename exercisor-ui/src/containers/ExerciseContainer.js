import { connect } from 'react-redux';
import ExerciseView from '../components/ExerciseView';
import {
  loadEvents, saveEvent, removeEvent, loadYearGoals, saveGoals, loadRoute,
} from '../redux/thunks';
import {
  setEntryDate, setEntryCalories, setEntryDistance, setEntryDuration,
  setEditKey, setEntry, settingListAll, setGoalsEventSum, setEntryType,
  setGoalsWeeklyDist,
} from '../redux/actions';

const mapStateToProps = (state, ownProps) => ({
  goals: state.goals,
  settings: state.settings,
  editKey: state.editKey,
  entry: state.entry,
  events: state.events,
  name: ownProps.match.params.name,
  years: state.years,
  userOutOfSync: ownProps.match.params.name !== state.name && state.name != null,
  locations: state.locations,
  routes: state.routes,
  errorMessage: state.errorMessage,
});

const mapDispatchToProps = dispatch => ({
  onReloadUser: user => dispatch(loadEvents(user)),
  onEntryDate: date => dispatch(setEntryDate(date)),
  onEntryDuration: duration => dispatch(setEntryDuration(duration)),
  onEntryDistance: distance => dispatch(setEntryDistance(distance)),
  onEntryCalories: calories => dispatch(setEntryCalories(calories)),
  onEntryType: type => dispatch(setEntryType(type)),
  onSave: () => dispatch(saveEvent()),
  onSetEditKey: key => dispatch(setEditKey(key)),
  onSetEntry: entry => dispatch(setEntry(entry)),
  onRemoveEntry: entryId => dispatch(removeEvent(entryId)),
  onListAll: value => dispatch(settingListAll(value)),
  onLoadGoals: (user, year) => dispatch(loadYearGoals(user, year)),
  onSetGoalsEventSum: events => dispatch(setGoalsEventSum(events)),
  onSetGoalsDistanceWeekly: dist => dispatch(setGoalsWeeklyDist(dist)),
  onSaveGoals : (user, year) => dispatch(saveGoals(user, year)),
  onLoadRoute : (from, to) => dispatch(loadRoute(from, to)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExerciseView);
