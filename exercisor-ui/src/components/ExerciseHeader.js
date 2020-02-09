import React from 'react';

export default function ExerciseHeader({ match, onLogout, loggedIn }) {
  const { name } = match.params;
  return (
    <header className="App-header header-with-main">
      {loggedIn && <div className="logout pill buttonized" onClick={onLogout}>Logga ut</div>}
      <h1>Exercisor: <span className='name'>{name}</span></h1>
    </header>
  );
}
