import { connect } from 'react-redux';
import { logout } from '../redux/thunks';
import ExerciseHeader from '../components/ExerciseHeader'

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  error: state.error,
  loggedIn: state.loggedIn,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onLogout: () => dispatch(logout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExerciseHeader);
