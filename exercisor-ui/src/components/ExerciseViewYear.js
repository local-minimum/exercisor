import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';
import { filterEvents } from '../util';

export default function ExerciseViewYear(props) {
  const locArr = props.location.pathname.split('/');
  const year = locArr[locArr.indexOf(props.match.params.name) + 1];
  console.log(locArr, year, props);
  const events = filterEvents(props.events, year);
  return (
    <div>
      <ExerciseSummary events={events} year={year} />
      <ExerciseTable {...props} events={events} />
    </div>
  );
}
