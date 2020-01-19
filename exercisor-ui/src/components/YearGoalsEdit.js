import React from 'react';

function getGoal(goals, path) {
  if (goals == null) return 0;
  let val = goals;
  path.forEach(key => {
    val = val[key];
    if (val == null) return 0;
  });
  return val == null ? 0 : val;
}

export default function YearGoalsEdit({
  goals, year, onSetGoalsEventSum, onSaveGoals, name, onSetGoalsDistanceWeekly,
}) {
  const intro = goals === null || goals.fake ? "Det är mer kul med mål!" : "Uppdatera dina mål";
  const eventsSum = getGoal(goals, ['sums', 'events']);
  const distWeekly = getGoal(goals, ['weekly', 'distance']);
  return (
    <div>
      <h2>Mål för {year}</h2>
      <em>{intro}</em>
      <div>
        <span>Träningspass: </span>
        <input type="number" min={0} value={eventsSum} onChange={(evt) => onSetGoalsEventSum(Number(evt.target.value))}/>
      </div>
      <div>
        <span>Distans per vecka (km): </span>
        <input type="number" min={0} value={distWeekly} onChange={(evt) => onSetGoalsDistanceWeekly(Number(evt.target.value))}/>
      </div>
      <input type="button" value="Spara" onClick={() => onSaveGoals(name, year)} />
    </div>
  );
}
