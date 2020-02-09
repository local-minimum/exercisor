import React from 'react';

import Login from './Login';

export default class ExerciseHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogin: false,
    };
  }

  render() {
    const { loggedIn, match, onLogout, onLogin, error } = this.props;
    const { showLogin } = this.state;
    const { name } = match.params;
    const UserBtn = loggedIn ?
      <div className="logout pill buttonized" onClick={onLogout}>Logga ut</div>
      : (showLogin ? null : <div className="logout pill buttonized" onClick={() => this.setState({ showLogin: true })}>Logga in</div>);
    const ShowLogin = !loggedIn && showLogin ? <Login onLogin={onLogin} error={error} /> : null;
    return (
      <header className="App-header header-with-main">
        {UserBtn}
        <h1>Exercisor: <span className='name'>{name}</span></h1>
        {ShowLogin}
      </header>
    );
  }

  componentDidMount() {
    const { testSession } = this.props;
    if (testSession) testSession();
  }

  componentDidUpdate() {
    const { showLogin } = this.state;
    const { loggedIn } = this.props;
    if (loggedIn && showLogin) this.setState({ showLogin: false });
  }
}
