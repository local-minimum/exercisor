import React from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import ExerciseContainer from './containers/ExerciseContainer';
import './App.css';


function NoUserHeader(props) {
  const onLinkEnter = (e) => {
    if (e.key === 'Enter') {
      const { url } = props.match;
      const prefix = url.endsWith('/') ? url : `${url}/`
      props.history.push(`${prefix}${e.target.value.toLocaleLowerCase()}`);
    }
  }
  return  (
    <header className="App-header header-only">
      <h1>Exercisor</h1>
      <input type="text" autoFocus placeholder="Name" onKeyDown={onLinkEnter} />
    </header>
  );
}

function UserHeader({match}) {
  const { name } = match.params;
  const path = match.url.split('/')
  const root = path.slice(0, path.indexOf(match.params.name)).join('/')
  return (
    <header className="App-header header-with-main">
      <Link className="logout" to={root}>Logga ut</Link>
      <h1>Exercisor: <span className='name'>{name}</span></h1>
    </header>
  );
}

function ExercisorRoutingHeader({ match }) {
  return (
    <Switch>
      <Route path={`${match.path}/:name`} component={UserHeader} />
      <Route path={`${match.path}`} component={NoUserHeader} />
    </Switch>
  );
}

function ExercisorRoutingBody({ match }) {
  return (
    <Switch>
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
          <Route path="/:name" component={UserHeader} />
          <Route path="/" component={NoUserHeader} />
        </Switch>
        <div className="App-main">
          <Switch>
            <Route path="/exercisor" component={ExercisorRoutingBody} />
            <Route path="/:name" component={ExerciseContainer} />
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
