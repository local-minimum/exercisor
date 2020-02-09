import { connect } from 'react-redux';
import { logout, login, mySettings } from '../redux/thunks';
import ExerciseHeader from '../components/ExerciseHeader'

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  error: state.error,
  loggedIn: state.loggedIn,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onLogout: () => dispatch(logout()),
  onLogin: (name, password) => dispatch(login(name, password)),
  testSession: () => dispatch(mySettings()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExerciseHeader);
