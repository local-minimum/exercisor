import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ExerciseContainer from './ExerciseContainer';
import './App.css';


function NoUserHeader(props) {
  const onLinkEnter = (e) => {
    if (e.key === 'Enter') {
      const { url } = props.match;
      const prefix = url.endsWith('/') ? url : `${url}/`
      props.history.push(`${prefix}${e.target.value}`);
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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/exercisor" component={NoUserHeader} />
          <Route exact path="/exercisor/:name" component={UserHeader} />
          <Route exact path="/:name" component={UserHeader} />
          <Route exact path="/" component={NoUserHeader} />
        </Switch>
        <div className="App-main">
          <Switch>
            <Route exact path="/exercisor" component={null} />
            <Route exact path="/exercisor/:name" component={ExerciseContainer} />
            <Route exact path="/:name" component={ExerciseContainer} />
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
