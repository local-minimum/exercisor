import React from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import ExerciseContainer from './containers/ExerciseContainer';
import RegisterContainer from './containers/RegisterContainer';
import FrontHeaderContainer from './containers/FrontHeaderContainer';
import ExerciseHeaderContainer from './containers/ExerciseHeaderContainer';
import './App.css';

function RegisterHeader({ match }) {
  const path = match.url.split('/')
  const root = path.slice(0, path.indexOf(match.params.name)).join('/')
  return (
    <header className="App-header header-with-main">
      <Link className="logout" to={root}>Tillbaka</Link>
    </header>
  );
}

function ExercisorRoutingHeader({ match }) {
  return (
    <Switch>
      <Route path={`${match.path}/register`} component={RegisterHeader} />
      <Route path={`${match.path}/:name`} component={ExerciseHeaderContainer} />
      <Route path={`${match.path}`} component={FrontHeaderContainer} />
    </Switch>
  );
}

function ExercisorRoutingBody({ match }) {
  return (
    <Switch>
      <Route path={`${match.path}/register`} component={RegisterContainer} />
      <Route path={`${match.path}/:name`} component={ExerciseContainer} />
    </Switch>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/exercisor" component={ExercisorRoutingHeader} />
          <Route path="/register" component={RegisterHeader} />
          <Route path="/:name" component={ExerciseHeaderContainer} />
          <Route path="/" component={FrontHeaderContainer} />
        </Switch>
        <div className="App-main">
          <Switch>
            <Route path="/exercisor" component={ExercisorRoutingBody} />
            <Route path="/register" component={RegisterContainer} />
            <Route path="/:name" component={ExerciseContainer} />
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
