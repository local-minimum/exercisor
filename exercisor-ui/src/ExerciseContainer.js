import { connect } from 'react-redux';
import ExerciseView from './ExerciseView';
import { loadEvents } from './redux/thunks';

const mapStateToProps = (state, ownProps) => ({
  excercises: state.events.length,
  events: state.events,
  name: ownProps.match.params.name,
  userOutOfSync: ownProps.match.params.name !== state.name && state.name != null,
});

const mapDispatchToProps = dispatch => ({
  onReloadUser: (user, year) => dispatch(loadEvents(user, year)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExerciseView);
