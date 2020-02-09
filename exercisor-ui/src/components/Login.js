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
    if (e.key === 'Enter') {
      const { match, onLogin } = this.props;
      const { name, password } = this.state;
      const { url } = match;
      const prefix = url.endsWith('/') ? url : `${url}/`
      const userUrl = `${prefix}${name.toLocaleLowerCase()}`
      onLogin(name, password, userUrl);
    }
  }

  handleChangeName = (e) => this.setState({ name: e.target.value });
  handleChangePassword = (e) => this.setState({ password: e.target.value });

  render() {
    const { error } = this.props;
    const { name, password } = this.state;
    return (
      <div>
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
      </div>
    );
  }
}
