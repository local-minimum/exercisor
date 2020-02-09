import React from 'react';
import { Link } from 'react-router-dom';

import Login from './Login';

export default function FrontHeader({ match, history, onLogin, error }) {
  const regUrl = match.path.length > 1 ? `${match.path}/register` : 'register';
  return  (
    <header className="App-header header-only">
      <h1>Exercisor</h1>
      <Login onLogin={onLogin} match={match} error={error} />
      <Link className="register" to={regUrl}>Registring</Link>
    </header>
  );
}
