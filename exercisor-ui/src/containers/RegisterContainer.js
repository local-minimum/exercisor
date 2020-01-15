import { connect } from 'react-redux';
import Register from '../components/Register';
import {
  register,
} from '../redux/thunks';
import {
  setRegUser, setRegPwd, setRegPwd2
} from '../redux/actions';

const mapStateToProps = (state, ownProps) => ({
  error: state.errorMessage,
  ...state.register,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onRegister: () => dispatch(register(ownProps)),
  onSetUser: (evt) => dispatch(setRegUser(evt.target.value)),
  onSetPwd: (evt) => dispatch(setRegPwd(evt.target.value)),
  onSetPwd2: (evt) => dispatch(setRegPwd2(evt.target.value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);
