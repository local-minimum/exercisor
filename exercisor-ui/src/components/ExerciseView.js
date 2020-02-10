import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ExerciseYears from './ExerciseYears';
import ExerciseViewYear from './ExerciseViewYear';
import ExerciseViewAll from './ExerciseViewAll';
import Error from './Error';
import ExerciseTypeFilter from './ExerciseTypeFilter';
import EditMode from './EditMode';
import './ExerciseView.css'
import { EXERCISE_VIEW_ERROR } from '../errors';

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
    const {
      years, match, error, events, eventTypeFilters,
      onSetEventTypeFilter, onChangeYear, onSetEditMode,
      loggedIn, editMode, name
    } = this.props;
    return <div className="App-main-item">
      <EditMode onSetEditMode={onSetEditMode} editMode={editMode} loggedIn={loggedIn} name={name} />
      <ExerciseYears years={years} match={match} onChangeYear={onChangeYear} />
      <ExerciseTypeFilter
        events={events}
        eventTypeFilters={eventTypeFilters}
        onToggleFilter={onSetEventTypeFilter}
      />
      <Error error={error} targetFilter={EXERCISE_VIEW_ERROR} />
      <Switch>
        <Route path={`${match.path}/:year`}><ExerciseViewYear {...this.props} /></Route>
        <Route path={`${match.path}`}><ExerciseViewAll {...this.props} /></Route>
      </Switch>
    </div>;
  }
}

export default ExerciseView;
