import { connect } from 'react-redux';
import { logout, login, mySettings } from '../redux/thunks';
import { switchUser } from '../util';
import ExerciseHeader from '../components/ExerciseHeader'

const mapStateToProps = (state, ownProps) => ({
  error: state.error,
  loggedIn: state.loggedIn,
  name: state.name,
  following: state.following,
});

const mapDispatchToProps = (dispatch, { match, history }) => ({
  onLogout: () => dispatch(logout()),
  onLogin: (name, password) => dispatch(login(name, password)),
  onSwitchUser: (fromName, toName) => switchUser(fromName, toName, history),
  testSession: () => dispatch(mySettings()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExerciseHeader);
