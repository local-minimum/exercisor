import React from 'react';
import { Link } from 'react-router-dom';

export default function ExerciseYears({ years, match }) {
    const path = match.url.split('/')
    const prefix = path.slice(0, path.indexOf(match.params.name) + 1).join('/')
    let total = Object.values(years).reduce((tot, count) => tot + count, 0);
    const yearsSpans = Object
      .entries(years)
      .map(([year, count]) => (
        <Link to={`${prefix}/${year}`} key={year}>
          <span className="year-summary">
            <strong>{year}</strong> ({count})
          </span>
        </Link>
      ));
    const backLink = <Link to={prefix}><span className="year-summary"><strong>Totalt</strong> ({total})</span></Link>;
    return (
      <div className="years-nav">{yearsSpans.length === 0 ? <em>Inget pass rapporterat än</em> : yearsSpans}{backLink}</div>
    );
}
