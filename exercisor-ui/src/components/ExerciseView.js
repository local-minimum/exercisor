import React from 'react';
import ExerciseYears from './ExerciseYears';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
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
    const { years, events } = this.props;
    return <div className="App-main-item">
      <ExerciseYears years={years} />
      <ExerciseSummary events={events} />
      <ExerciseTable {...this.props} />
    </div>;
  }
}

export default ExerciseView;
