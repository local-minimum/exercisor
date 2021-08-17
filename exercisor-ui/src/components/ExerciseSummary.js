import React from 'react';
import { getPeriodDuration } from '../util';
import './ExerciseSummary.css';

const MILLIES_IN_A_DAY = 24 * 60 * 60 * 1000;

export const nicePace = (pace) => {
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}:${seconds.toFixed(0).padStart(2, '0')}`
}


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
  if (minutes > 0 || duration.length === 0) {
    if (duration.length > 0) duration.push(' ');
    duration.push(<span key='min'><strong>{minutes.toFixed(0)}</strong> min</span>);
  }
  return duration
}

export default function ExerciseSummary({ events, year }) {
    const stats = {
      distance: 0,
      duration: 0,
      calories: 0,
      events: events.length,
      longest: 0,
      fastest: null,
      streak: {
        currentStart: null,
        currentEnd: 0,
        recordDays: 0,
        currentDays: 0,
        recordDistance: 0,
        currentDistance: 0,
      },
    };
    events
      .slice()
      .sort((first, second) => new Date(first.date) - new Date(second.date))
      .forEach(evt => {
        stats.distance += (evt.distance == null ? 0 : evt.distance);
        stats.duration += (evt.duration == null ? 0 : evt.duration);
        stats.calories += (evt.calories == null ? 0 : evt.calories);
        if (evt.distance > stats.longest) {
          stats.longest = evt.distance
        }
        if (stats.fastest == null || stats.fastest > (evt.duration / evt.distance)) {
          stats.fastest = evt.duration / evt.distance;
        }
        const today = new Date(evt.date)
        if (stats.streak.currentStart == null) {
          stats.streak.currentStart = today;
          stats.streak.currentEnd = today;
          stats.streak.recordDays = 1;
          stats.streak.currentDistance = evt.distance == null ? 0 : evt.distance;
        } else {
          let delta = today - stats.streak.currentEnd;
          if (Math.round(delta / MILLIES_IN_A_DAY) <= 1) {
            stats.streak.currentEnd = today;
            stats.streak.currentDistance += evt.distance == null ? 0 : evt.distance;
          } else {
            delta = stats.streak.currentEnd - stats.streak.currentStart;
            stats.streak.currentDays = Math.round(delta / MILLIES_IN_A_DAY) + 1;
            stats.streak.recordDays = Math.max(stats.streak.recordDays, stats.streak.currentDays);
            stats.streak.currentEnd = today;
            stats.streak.currentStart = today;
            stats.streak.recordDistance = Math.max(stats.streak.recordDistance, stats.streak.currentDistance)
            stats.streak.currentDistance = evt.distance;
          }
        }
      });
    const delta = stats.streak.currentEnd - stats.streak.currentStart;
    stats.streak.currentDays = Math.round(delta / MILLIES_IN_A_DAY) + 1;
    stats.streak.recordDays = Math.max(stats.streak.recordDays, stats.streak.currentDays);
    stats.streak.recordDistance = Math.max(stats.streak.recordDistance, stats.streak.currentDistance)
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
        <div className="summaries-group pill-box">
          <h3>Rekord</h3>
          <div className="pill"><i>Längsta </i><strong>{stats.longest.toFixed(2)}</strong> km</div>
          <div className="pill"><i>Snabbaste </i><strong>{stats.fastest == null ? 'xxx' : nicePace(stats.fastest.toFixed(1))}</strong> min/km</div>
        </div>
        <div className="summaries-group pill-box">
          <h3>Längsta svit (nuvarande)</h3>
          <div className="pill"><strong>{stats.streak.recordDays.toFixed(0)}</strong> dagar ({stats.streak.currentDays.toFixed(0)} dagar)</div>
          <div className="pill"><strong>{stats.streak.recordDistance.toFixed(0)}</strong> km ({stats.streak.currentDistance.toFixed(0)} km)</div>
        </div>
      </div>
    );
};
