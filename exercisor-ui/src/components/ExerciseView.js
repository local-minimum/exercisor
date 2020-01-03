import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ExerciseYears from './ExerciseYears';
import ExerciseViewYear from './ExerciseViewYear';
import ExerciseViewAll from './ExerciseViewAll';
import './ExerciseView.css'

class ExerciseView extends React.Component {
  componentDidMount() {
    const { onReloadUser, name } = this.props;
    onReloadUser(name);
  }

  componentDidUpdate() {
    const { userOutOfSync, onReloadUser, name } = this.props;
    if (userOutOfSync) onReloadUser(name);
  }

  render() {
    const { years, match } = this.props;
    return <div className="App-main-item">
      <ExerciseYears years={years} match={match} />
      <Switch>
        <Route path={`${match.path}/:year`}><ExerciseViewYear {...this.props} /></Route>
        <Route path={`${match.path}`}><ExerciseViewAll {...this.props} /></Route>
      </Switch>
    </div>;
  }
}

export default ExerciseView;
