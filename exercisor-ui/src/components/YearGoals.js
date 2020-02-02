import React from 'react';
import { Progress } from 'react-sweet-progress';
import GaugeChart from 'react-gauge-chart';
import { getYearDurationSoFar, getYearDuration } from '../util';
import './YearGoals.css';
import Error from './Error';
import { EXERCISE_GOALS_ERROR } from '../errors';


function Goal(
  key,
  name,
  percent,
  value,
  target,
  gauge,
  error,
) {
    const symbol = (
      <div className={`progress-symbol progress-${name}`}>
        <h3>{percent >= 100 ? '✔ ' : ''}{name}</h3>
        {`${value}/${target}`}
      </div>
    );

    let gaugeText = "Är målet för lätt?";
    if (gauge > 0.6 && gauge < 0.8) {
      gaugeText = "Flitigt!";
    } else if (gauge > 0.4 && gauge <= 0.8) {
      gaugeText = "På våg mot målet";
    } else if (gauge > 0.2 && gauge <= 0.4) {
      gaugeText = "Du måste öka!";
    } else if (gauge <= 0.2) {
      gaugeText = "Sätt lättare mål?";
    }

    const ShowProgress = percent != null ?
        <Progress
          key={`${key}-progress`}
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
        /> : null;

    return (
      <div>
        <Error error={error} targetFilter={EXERCISE_GOALS_ERROR} />
        <div key={key} className="goal-group">
          {ShowProgress}
          <div>
            <GaugeChart
              id={`${key}-gauge`}
              percent={gauge}
              nrOfLevels={5}
              colors={['#e86a51','#f4a261', '#b5ceab','#5b9e6f', '#317240']}
              marginInPercent={.01}
              arcPadding={.01}
              arcWidth={.18}
              cornerRadius={2}
              hideText
              style={{ width: 140 }}
            />
            <div className={`gauge-caption progress-${name}`}>
              <h3>{name}</h3>
              {gaugeText}
            </div>
          </div>
        </div>
      </div>
    );
}

function EventsGoal(year, events, goals) {
    const count = events.length;
    const target = goals.sums.events;
    const percent = 100 * count / target;
    const period = getYearDurationSoFar(year);
    const yearDuration = getYearDuration(year);
    const gauge = Math.max(
      Math.min(
        (count / period) / (target / yearDuration) - 0.5,
        1,
      ),
      0,
    );
    return Goal(
      'year-events',
      "Pass",
      percent,
      count,
      target,
      gauge,
    );
}

function WeeklyDistGoal(year, events, goals) {
    const totalDistance = events
      .reduce((acc, evt) => acc + (evt.distance == null ? 0 : evt.distance), 0);
    const target = goals.weekly.distance;
    const days = getYearDurationSoFar(year);
    const weekly = totalDistance / days * 7;
    const gauge = Math.max(
      Math.min(
        (weekly / target) - 0.5,
        1,
      ),
      0,
    );
    return Goal(
      'weekly-distance',
      `${weekly.toFixed(1)} km / vecka`,
      null,
      weekly,
      target,
      gauge,
    );
}

export default function YearGoals({ events, goals, year }) {
  const hasGoals = (
    goals != null &&
    (
      (goals.sums != null && goals.sums.events !== 0 && goals.sums.events != null)
      || (goals.weekly != null && goals.weekly.distance !== 0 && goals.weekly.distance != null)
    )
  );
  if (!hasGoals) return null;
  const Goals = []
  if (goals.sums != null && goals.sums.events != null && goals.sums.events > 0) {
    Goals.push(EventsGoal(year, events, goals));
  }
  if (goals.weekly != null && goals.weekly.distance != null && goals.weekly.distance > 0) {
    Goals.push(WeeklyDistGoal(year, events, goals));
  }
  return (
    <div>
      <h2>Mål för {year}</h2>
      <div className="goals-meters">
        {Goals}
      </div>
    </div>
  )
}
