import React from 'react';
import { getPeriodDuration } from '../util';
import './ExerciseSummary.css';

export const niceDuration = (durationMinutes) => {
  const days = Math.floor(durationMinutes / (60 * 24));
  const duration = []
  if (days > 0) {
    duration.push(<span key='days'><strong>{days.toFixed(0)}</strong> d</span>);
  }
  const lessThanDayDuration = durationMinutes - days * 60 * 24;
  const hours = Math.floor(lessThanDayDuration / 60);
  if (hours > 0) {
    if (duration.length > 0) duration.push(' ');
    duration.push(<span key='hours'><strong>{hours.toFixed(0)}</strong> h</span>);
  }
  const minutes = lessThanDayDuration - hours * 60;
  if (duration.length > 0) duration.push(' ');
  duration.push(<span key='min'><strong>{minutes.toFixed(0)}</strong> min</span>);
  return duration
}

export default function ExerciseSummary({ events, year }) {
    const stats = {distance: 0, duration: 0, calories: 0, events: events.length};
    events.forEach(evt => {
      stats.distance += (evt.distance == null ? 0 : evt.distance);
      stats.duration += (evt.duration == null ? 0 : evt.duration);
      stats.calories += (evt.calories == null ? 0 : evt.calories);
    });
    const weekly = 7 / getPeriodDuration(events, year);
    return (
      <div className="summary">
        <h2>Sammanställning {year != null ? `${year}` : "all tid"}</h2>
        <div className="summaries-box">
          <div className="summaries-group pill-box">
            <h3>Totalt</h3>
            <div className="pill"><strong>{stats.distance.toFixed(0)}</strong> km</div>
    <div className="pill">{niceDuration(stats.duration)}</div>
            <div className="pill"><strong>{stats.calories.toFixed(0)}</strong> kcal</div>
            <div className="pill"><strong>{stats.events}</strong> pass</div>
          </div>
          <div className="summaries-group pill-box">
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
