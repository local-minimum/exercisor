import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ExerciseContainer from './ExerciseContainer';
import './App.css';


function NoUserHeader(props) {
  const onLinkEnter = (e) => {
    if (e.key === 'Enter') props.history.push(`/${e.target.value}`);
  }
  return  (
    <header className="App-header header-only">
      <h1>Exercisor</h1>
      <input type="text" autoFocus placeholder="Name" onKeyDown={onLinkEnter} />
    </header>
  );
}

function UserHeader(props) {
  const { name } = props.match.params;
  return (
    <header className="App-header header-with-main">
      <h1>Exercisor: <span className='name'>{name}</span></h1>
    </header>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/exercisor" component={NoUserHeader} />
          <Route path="/exercisor/:name" component={UserHeader} />
          <Route path="/:name" component={UserHeader} />
          <Route path="/" component={NoUserHeader} />
        </Switch>
        <div className="App-main">
          <Switch>
            <Route path="/exercisor" component={null} />
            <Route path="/exercisor/:name" component={ExerciseContainer} />
            <Route path="/:name" component={ExerciseContainer} />
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
