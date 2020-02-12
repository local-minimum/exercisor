import React from 'react';

import Login from './Login';
const MAX_VIEW_FOLLOW_LIST = 3;

export default class ExerciseHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogin: false,
    };
  }

  render() {
    const { loggedIn, name, onLogout, onLogin, error, onSwitchUser, following } = this.props;
    if (name == null) return <header className="App-header header-with-main"></header>;
    const { showLogin } = this.state;
    const UserBtn = loggedIn == null ?
      (showLogin ? null : <div className="user-nav-btn pill buttonized" onClick={() => this.setState({ showLogin: true })}>Logga in</div>)
      : <div className="user-nav-btn pill buttonized" onClick={onLogout}>Logga ut</div>;
    const ShowLogin = loggedIn == null && showLogin ? <Login onLogin={onLogin} error={error} /> : null;
    const NavToSelf = loggedIn == null || loggedIn === name ? null : <div className="user-nav-btn pill buttonized name" onClick={() => onSwitchUser(name, loggedIn)}>{loggedIn}</div>;
    const Follows = following
      .filter(follow => follow.name !== name)
      .slice(0, MAX_VIEW_FOLLOW_LIST)
      .map(follow => <div className="user-nav-btn pill buttonized name" key={follow.id} onClick={() => onSwitchUser(name, follow.name)}>{follow.name}</div>)
    return (
      <header className="App-header header-with-main">
        <div className="App-header user-nav">
        {UserBtn}
        {NavToSelf}
        {Follows}
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
