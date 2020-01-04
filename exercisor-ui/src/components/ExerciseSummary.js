import React from 'react';
import { aDay } from '../util';
import './ExerciseSummary.css';

export default function ExerciseSummary({ events, year }) {
    const stats = {distance: 0, duration: 0, calories: 0, events: events.length};
    events.forEach(evt => {
      stats.distance += (evt.distance == null ? 0 : evt.distance);
      stats.duration += (evt.duration == null ? 0 : evt.duration);
      stats.calories += (evt.calories == null ? 0 : evt.calories);
    });
    let periodStart = 0;
    let periodEnd = 0;
    if (year == null) {
      if (events.length > 0) {
        periodStart = new Date(events[events.length - 1].date).getTime();
        periodEnd = new Date(events[0].date).getTime();
      }
    } else {
      periodStart = new Date(`${year}-01-01`).getTime();
      if (events.length > 0) {
        const firstDate = new Date(events[events.length - 1].date).getTime();
        if ((firstDate - periodStart) / aDay > 10) periodStart = firstDate;
      }
      periodEnd = Math.min(
        new Date(`${year}-12-31`).getTime(),
        new Date().getTime()
      );
    }
    const weekly = 7 / (Math.floor((periodEnd - periodStart) / aDay) + 1);
    return (
      <div className="summary">
        <h2>Sammanställning {year != null ? `${year}` : "all tid"}</h2>
        <div className="summaries-box">
          <div className="summaries-group">
            <h3>Totalt</h3>
            <div className="pill"><strong>{stats.distance.toFixed(0)}</strong> km</div>
            <div className="pill"><strong>{stats.duration.toFixed(0)}</strong> min</div>
            <div className="pill"><strong>{stats.calories.toFixed(0)}</strong> kcal</div>
            <div className="pill"><strong>{stats.events}</strong> pass</div>
          </div>
          <div className="summaries-group">
            <h3>Veckovis</h3>
            <div className="pill"><strong>{(stats.distance * weekly).toFixed(1)}</strong> km</div>
            <div className="pill"><strong>{(stats.duration * weekly).toFixed(1)}</strong> min</div>
            <div className="pill"><strong>{(stats.calories * weekly).toFixed(1)}</strong> kcal</div>
            <div className="pill"><strong>{(stats.events * weekly).toFixed(1)}</strong> pass</div>
          </div>
        </div>
      </div>
    );
};
