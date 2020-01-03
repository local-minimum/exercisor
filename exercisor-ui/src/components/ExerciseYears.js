import React from 'react';
import { Link } from 'react-router-dom';

export default function ExerciseYears({ years, match }) {
    const path = match.url.split('/')
    const prefix = path.slice(0, path.indexOf(match.params.name) + 1).join('/')
    const yearsSpans = Object
      .entries(years)
      .map(([year, count]) => (
        <Link to={`${prefix}/${year}`}>
          <span className="year-summary" key={year}>
            <strong>{year}</strong> ({count})
          </span>
        </Link>
      ));
    return (
      <div className="years-nav">{yearsSpans.length === 0 ? <em>Inget pass rapporterat än</em> : yearsSpans}</div>
    );
}
