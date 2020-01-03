import React from 'react';
import ExerciseSummary from './ExerciseSummary';
import ExerciseTable from './ExerciseTable';

export default function ExerciseViewAll(props) {
  const { events } = props;
  return (
    <div>
      <ExerciseSummary events={events} />
      <ExerciseTable {...props} />
    </div>
  );
}
