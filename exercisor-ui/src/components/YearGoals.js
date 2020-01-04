import React from 'react';
import { Progress } from 'react-sweet-progress';
import './YearGoals.css';

export default function YearGoals({ events, goals, year }) {
  const noGoals = (goals === null || goals.sums.events === 0);
  const Intro = noGoals ? <em>Inga mål inlagda...</em> : null;
  const Goals = []
  if (!noGoals) {
    if (goals.sums.events > 0) {
      const count = events.length;
      const target = goals.sums.events;
      const percent = 100 * count / target;
      const symbol = (
        <div className="progress-symbol progress-symbol-events">
          <h3>{percent >= 100 ? '✔ ' : ''}Pass</h3>
          {`${count}/${target}`}
        </div>
      );
      Goals.push(
        <Progress
          key="events-progress"
          type="circle"
          percent={percent}
          status="success"
          strokeWidth={8}
          theme={{
            success: {
              symbol,
              color: '#007944',
              trailColor: '#71a95a',
            },
          }}
        />
      );
    }
  }
  return (
    <div>
      <h2>Mål för {year}</h2>
      {Intro}
      <div className="goals-meters">
        {Goals}
      </div>
    </div>
  )
}
