import React from 'react';

export default function ExerciseSummary({ events }) {
    const oneDay = 1000 * 60 * 60 * 24;
    const stats = {distance: 0, events: events.length, periodStart: null, periodEnd: null};
    events.forEach(evt => {
      stats.distance = stats.distance += (evt.distance == null ? 0 : evt.distance);
      const timestamp = new Date(evt.date).getTime();
      stats.periodStart = stats.periodStart == null ? timestamp : Math.min(stats.periodStart, timestamp);
      stats.periodEnd = stats.periodEnd == null ? timestamp : Math.max(stats.periodEnd, timestamp);
    });
    const timeSpan = stats.periodStart != null ? Math.floor((stats.periodEnd - stats.periodStart) / oneDay) + 1 : 0;
    const perWeek = timeSpan === 0 ? "0" : (stats.events / timeSpan * 7).toFixed(2);
    return (
      <div>
        <h2>Sammanställning</h2>
        <div>Totalt {stats.distance.toFixed(0)} km och {stats.events} pass. Hållt på i {timeSpan} dagar, {perWeek} pass i veckan.</div>
      </div>
    );
};
