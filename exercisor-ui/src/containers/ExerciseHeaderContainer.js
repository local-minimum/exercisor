import { connect } from 'react-redux';
import { logout, login, mySettings } from '../redux/thunks';
import { switchUser } from '../util';
import ExerciseHeader from '../components/ExerciseHeader'

const RECENT = "recentUsersViewed";
const RECENT_MAX = 3;

const mapStateToProps = (state, ownProps) => {
  let recent = localStorage.getItem(RECENT)
  let following = state.following.slice()
  if (recent != null) {
    recent = recent.split(',').filter(usr => usr.length > 0);
    if (following == null) {
      following = recent.map(name => ({ name, id: name }));
    } else {
      recent.forEach(user => {
        if (user !== state.name && !following.some(usr => usr.name === user)) {
          following.push({name: user, id: user});
        }
      });
    }
  }
  if (recent == null) {
    localStorage.setItem(RECENT, [state.name]);
  } else if (!recent.some(user => user === state.name)) {
    recent.push(state.name);
    if (recent.length > RECENT_MAX) {
      recent = recent.slice(recent.length - RECENT_MAX);
    }
    localStorage.setItem(RECENT, recent)
  }
  return {
    error: state.error,
    loggedIn: state.loggedIn,
    name: state.name,
    following: following,
  };
};

const mapDispatchToProps = (dispatch, { history }) => ({
  onLogout: () => dispatch(logout()),
  onLogin: (name, password) => dispatch(login(name, password)),
  onSwitchUser: (fromName, toName) => switchUser(fromName, toName, history),
  testSession: () => dispatch(mySettings()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExerciseHeader);
