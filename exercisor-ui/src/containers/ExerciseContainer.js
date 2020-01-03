import { connect } from 'react-redux';
import ExerciseView from '../components/ExerciseView';
import { loadEvents, saveEvent, removeEvent } from '../redux/thunks';
import {
  setEntryDate, setEntryCalories, setEntryDistance, setEntryDuration,
  setEditKey, setEntry, settingListAll,
} from '../redux/actions';

const date2year = (date) => Number(date.split("-")[0])

const filterEvents = (events, match) => {
  const year = match.params.year;
  if (year == null) return events;
  return events.filter(evt => date2year(evt.date) === year);
}

const mapStateToProps = (state, ownProps) => ({
  settings: state.settings,
  editKey: state.editKey,
  entry: state.entry,
  events: filterEvents(state.events, ownProps.match),
  name: ownProps.match.params.name,
  years: state.years,
  userOutOfSync: ownProps.match.params.name !== state.name && state.name != null,
});

const mapDispatchToProps = dispatch => ({
  onReloadUser: (user, year) => dispatch(loadEvents(user, year)),
  onEntryDate: date => dispatch(setEntryDate(date)),
  onEntryDuration: duration => dispatch(setEntryDuration(duration)),
  onEntryDistance: distance => dispatch(setEntryDistance(distance)),
  onEntryCalories: calories => dispatch(setEntryCalories(calories)),
  onSave: () => dispatch(saveEvent()),
  onSetEditKey: key => dispatch(setEditKey(key)),
  onSetEntry: entry => dispatch(setEntry(entry)),
  onRemoveEntry: entryId => dispatch(removeEvent(entryId)),
  onListAll: value => dispatch(settingListAll(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExerciseView);
