import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ExerciseYears from './ExerciseYears';
import ExerciseViewYear from './ExerciseViewYear';
import ExerciseViewAll from './ExerciseViewAll';
import EditKey from './EditKey';
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
    const { years, match, editKey, onSetEditKey, errorMessage } = this.props;
    console.log(errorMessage);
    return <div className="App-main-item">
      <EditKey editKey={editKey} onSetEditKey={onSetEditKey} />
      <ExerciseYears years={years} match={match} />
      {errorMessage && <div className="error">{errorMessage}</div>}
      <Switch>
        <Route path={`${match.path}/:year`}><ExerciseViewYear {...this.props} /></Route>
        <Route path={`${match.path}`}><ExerciseViewAll {...this.props} /></Route>
      </Switch>
    </div>;
  }
}

export default ExerciseView;
