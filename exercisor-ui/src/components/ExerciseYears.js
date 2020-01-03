import React from 'react';

export default function ExerciseYears({ years }) {
    const yearsSpans = Object
      .entries(years)
      .map(([year, count]) => <span className="year-summary" key={year}><strong>{year}</strong> ({count})</span>);
    return (
      <div className="years-nav">{yearsSpans.length === 0 ? <em>Inget pass rapporterat än</em> : yearsSpans}</div>
    );
}
