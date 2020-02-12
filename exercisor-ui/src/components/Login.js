import React from 'react';

import Error from './Error';
import { LOGIN_ERROR } from '../errors';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: (props.name == null ? '' : props.name),
      password: '',
    };
  }

  handleEnter = (e) => {
    if (e.key === 'Enter') this.handleLogin();
  }

  handleLogin = () => {
    const { match, onLogin, routeLogin } = this.props;
    const { name, password } = this.state;
    if (routeLogin) {
      const { url } = match;
      const prefix = url.endsWith('/') ? url : `${url}/`
      const userUrl = `${prefix}${name.toLocaleLowerCase()}`
      onLogin(name, password, userUrl);
    } else {
      onLogin(name, password);
    }
  }

  handleChangeName = (e) => this.setState({ name: e.target.value });
  handleChangePassword = (e) => this.setState({ password: e.target.value });

  render() {
    const { error } = this.props;
    const { name, password } = this.state;
    return (
      <div className="logins">
        <Error error={error} targetFilter={LOGIN_ERROR} />
        <input
          type="text"
          autoFocus
          placeholder="Namn"
          onKeyDown={this.handleEnter}
          onChange={this.handleChangeName}
          value={name}
        />
        <input
          type="password"
          placeholder="Lösenord"
          onKeyDown={this.handleEnter}
          onChange={this.handleChangePassword}
          value={password}
        />
        <div className="buttonized pill login-btn" onClick={this.handleLogin}>Logga in</div>
      </div>
    );
  }
}
