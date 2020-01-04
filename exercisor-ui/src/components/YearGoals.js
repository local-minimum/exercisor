import React from 'react';

export default function YearGoals({ events, goals, year }) {
  const noGoals = (goals === null || goals.sums.events === 0);
  const Intro = noGoals ? <em>Inga mål inlagda...</em> : null;
  const Goals = []
  if (!noGoals) {
    if (goals.sums.events > 0) {
      const count = events.length;
      const target = goals.sums.events;
      const percent = 100 * count / target;
      Goals.push(
        <div key='events'>Träningspass: {count}/{target} ({percent.toFixed(1)}%)</div>
      );
    }
  }
  return (
    <div>
      <h2>Mål för {year}</h2>
      {Intro}
      {Goals}
    </div>
  )
}
