import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
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

function UserHeader(props) {
  const { name } = props.match.params;
  return (
    <header className="App-header header-with-main">
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
