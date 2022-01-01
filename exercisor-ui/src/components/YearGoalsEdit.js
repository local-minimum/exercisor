import React from 'react';
import Error from './Error';
import { EXERCISE_GOALS_ERROR } from '../errors';

function getGoal(goals, path) {
  if (goals == null) return 0;
  let val = goals;
  path.forEach(key => {
    val = val != null ? val[key] : null;
  });
  return val == null ? 0 : val;
}

export default function YearGoalsEdit({
  goals, year, onSetGoalsEventSum, onSaveGoals, name, onSetGoalsDistanceWeekly,
  onSetGoalsDurationWeekly,
  error,
}) {
  const intro = goals === null || goals.fake ? "Det är mer kul med mål!" : "Uppdatera dina mål";
  const eventsSum = getGoal(goals, ['sums', 'events']);
  const distWeekly = getGoal(goals, ['weekly', 'distance']);
  const durationWeekly = getGoal(goals, ['weekly', 'duration']);
  return (
    <div>
      <h2>Mål för {year}</h2>
      <Error error={error} targetFilter={EXERCISE_GOALS_ERROR} />
      <em>{intro}</em>
      <div>
        <span>Träningspass: </span>
        <input type="number" min={0} value={eventsSum} onChange={(evt) => onSetGoalsEventSum(Number(evt.target.value))}/>
      </div>
      <div>
        <span>Distans per vecka (km): </span>
        <input type="number" min={0} value={distWeekly} onChange={(evt) => onSetGoalsDistanceWeekly(Number(evt.target.value))}/>
      </div>
      <div>
        <span>Tid per vecka (h): </span>
        <input type="number" min={0} value={durationWeekly} onChange={(evt) => onSetGoalsDurationWeekly(Number(evt.target.value))}/>
      </div>
      <input type="button" value="Spara" onClick={() => onSaveGoals(name, year)} />
    </div>
  );
}
