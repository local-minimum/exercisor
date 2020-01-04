import React from 'react';
import { Progress } from 'react-sweet-progress';
import GaugeChart from 'react-gauge-chart';
import { getPeriodDuration, getYearDuration } from '../util';
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
        <div className="progress-symbol progress-events">
          <h3>{percent >= 100 ? '✔ ' : ''}Pass</h3>
          {`${count}/${target}`}
        </div>
      );
      const period = getPeriodDuration(events, year);
      const yearDuration = getYearDuration(year);
      const gauge = Math.max(
        Math.min(
          (count / period) / (target / yearDuration) - 0.5,
          1,
        ),
        0,
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
      Goals.push(
        <div
          key="events-gauge"
        >
          <GaugeChart
            id='events-gauge'
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
          <div className='gauge-caption progress-events'>
            <h3>Pass</h3>
            {gaugeText}
          </div>
        </div>
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
