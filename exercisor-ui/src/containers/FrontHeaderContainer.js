import { connect } from 'react-redux';
import { login } from '../redux/thunks';
import FrontHeader from '../components/FrontHeader'

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  error: state.error,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onLogin: (name, password, url) => dispatch(login(name, password, url, ownProps.history)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FrontHeader);
