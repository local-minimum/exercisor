import { connect } from 'react-redux';
import ExerciseView from './ExerciseView';
import { loadEvents, saveEvent, removeEvent } from './redux/thunks';
import {
  setEntryDate, setEntryCalories, setEntryDistance, setEntryDuration,
  setEditKey, setEntry,
} from './redux/actions';

const mapStateToProps = (state, ownProps) => ({
  editKey: state.editKey,
  entry: state.entry,
  events: state.events,
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
  onRemoveEntry: entryId => dispatch(removeEvent(entryId))
});

export default connect(mapStateToProps, mapDispatchToProps)(ExerciseView);
