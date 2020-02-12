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
    const { loggedIn, name, onLogout, onLogin, error, onSwitchUser } = this.props;
    if (name == null) return <header className="App-header header-with-main"></header>;
    const { showLogin } = this.state;
    const UserBtn = loggedIn == null ?
      (showLogin ? null : <div className="user-nav-btn pill buttonized" onClick={() => this.setState({ showLogin: true })}>Logga in</div>)
      : <div className="user-nav-btn pill buttonized" onClick={onLogout}>Logga ut</div>;
    const ShowLogin = loggedIn == null && showLogin ? <Login onLogin={onLogin} error={error} /> : null;
    const NavToSelf = loggedIn == null || loggedIn === name ? null : <div className="user-nav-btn pill buttonized name" onClick={() => onSwitchUser(name, loggedIn)}>{loggedIn}</div>;
    return (
      <header className="App-header header-with-main">
        <div className="App-header user-nav">
        {UserBtn}
        {NavToSelf}
        </div>
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
    if (loggedIn != null && showLogin) this.setState({ showLogin: false });
  }
}
