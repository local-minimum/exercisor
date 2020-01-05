import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
import { filterEvents } from '../util';
import ExerciseOverviewCharts from './ExerciseOverviewCharts';
import YearGoalsEdit from './YearGoalsEdit';
import YearGoals from './YearGoals';
import CompensateCalories from './CompensateCalories';
import { events2timeSeries, events2convTimeSeries } from '../util';

export default class ExerciseViewYear extends React.Component {
  getYear = () => {
    const { location, match } = this.props;
    const locArr = location.pathname.split('/');
    return locArr[locArr.indexOf(match.params.name) + 1];
  }

  getName = () => this.props.match.params.name;

  render() {
    const { editKey, goals, onSetGoalsEventSum, onSaveGoals } = this.props;
    const year = this.getYear();
    const events = filterEvents(this.props.events, year != null ? Number(year) : null);
    const series = events2timeSeries(events);
    const convSeries = events2convTimeSeries(events);
    const Goals = editKey.length > 0 ? <YearGoalsEdit
      year={year}
      goals={goals}
      onSetGoalsEventSum={onSetGoalsEventSum}
      onSaveGoals={onSaveGoals}
      name={this.getName()}
    /> : <YearGoals year={year} goals={goals} events={events} />;
    return (
      <div>
        <ExerciseSummary events={events} year={year} />
        {Goals}
        <ExerciseTable {...this.props} events={events} />
        <ExerciseOverviewCharts series={series} convSeries={convSeries} />
        <CompensateCalories events={events} />
      </div>
    );
  }

  componentDidMount() {
    const year = this.getYear();
    const { onLoadGoals } = this.props;
    onLoadGoals(this.getName(), year);
  }

  componentDidUpdate() {
    const year = this.getYear();
    const { onLoadGoals } = this.props;
    onLoadGoals(this.getName(), year);
  }
}
