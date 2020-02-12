import { connect } from 'react-redux';
import { logout, login, mySettings } from '../redux/thunks';
import { switchUser } from '../util';
import ExerciseHeader from '../components/ExerciseHeader'

const mapStateToProps = (state, ownProps) => ({
  error: state.error,
  loggedIn: state.loggedIn,
  name: state.name,
});

const mapDispatchToProps = (dispatch, { match, history }) => ({
  onLogout: () => dispatch(logout()),
  onLogin: (name, password) => dispatch(login(name, password)),
  onSwitchUser: (name) => switchUser(name, match, history),
  testSession: () => dispatch(mySettings()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExerciseHeader);
