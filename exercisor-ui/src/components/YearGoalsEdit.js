import React from 'react';

export default function YearGoalsEdit({
  goals, year, onSetGoalsEventSum, onSaveGoals, name
}) {
  const intro = goals === null || goals.fake ? "Det är mer kul med mål!" : "Uppdatera dina mål";
  const sums = goals === null ? {events: 0} : goals.sums;
  return (
    <div>
      <h2>Mål för {year}</h2>
      <em>{intro}</em>
      <div>
        <span>Träningspass: </span>
        <input type="number" min={0} value={sums.events} onChange={(evt) => onSetGoalsEventSum(Number(evt.target.value))}/>
      </div>
      <input type="button" value="Spara" onClick={() => onSaveGoals(name, year)} />
    </div>
  );
}
