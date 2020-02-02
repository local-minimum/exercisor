import React from 'react';
import {
  ChartContainer, ChartRow, Resizable, Charts, Baseline,
  LabelAxis, ValueAxis, ScatterChart, YAxis, BarChart,
  styler,
} from 'react-timeseries-charts';
import { filter } from "pondjs";

const style = styler([
    { key: "distance", color: "#47bbbb" },
    { key: "calories", color: "#bb47bb" },
    { key: "duration", color: "#bb4747" },
]);

const weeklyStyle = styler([
    { key: "distance", color: "#47bbbb99" },
    { key: "calories", color: "#bb47bb99" },
    { key: "duration", color: "#bb474799" },
]);

const settings = {
    distance: {
      label: 'Distans [km]',
      unit: 'km',
      decimals: 2,
    },
    calories: {
      label: 'Kalorier [kcal]',
      unit: 'kcal',
      decimals: 0,
    },
    duration: {
      label: 'Tid [min]',
      unit: 'min',
      decimals: 1,
    }
};

export default class ExerciseOverviewCharts extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tracker: null };
  }

  handleTrackerChanged = t => this.setState({ tracker: t })

  renderChartRow = channelName => {
    const { series, weeklySeries } = this.props;
    const { tracker } = this.state;
    const { decimals, label, unit } = settings[channelName];
    const summary = [
        { label: "Min", value: series.min(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Max", value: series.max(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Snitt", value: series.avg(channelName, filter.ignoreMissing).toFixed(decimals) }
    ];
    let value = "--";
    if (tracker) {
      const timerange = series.range();
      const approx =
        (+tracker - +timerange.begin()) /
        (+timerange.end() - +timerange.begin());
      const ii = Math.floor(approx * series.size());
      const i = series.bisect(new Date(tracker), ii);
      const v = i < series.size() ? series.at(i).get(channelName) : null;
      if (v != null) {
        value = v.toFixed(decimals);
      }
    }

    return (
      <ChartRow key={channelName}>
        <LabelAxis
          id={`${channelName}_axis`}
          label={label}
          values={summary}
          min={series.min(channelName, filter.ignoreMissing)}
          max={series.max(channelName, filter.ignoreMissing)}
          width={140}
          type="linear"
          format=",.1f"
        />
        <Charts>
          <BarChart
              key={`line-${channelName}`}
              axis={`${channelName}_weeklyaxis`}
              series={weeklySeries}
              columns={[channelName]}
              style={weeklyStyle}
          />
          <ScatterChart
              key={`line-${channelName}`}
              axis={`${channelName}_axis`}
              series={series}
              columns={[channelName]}
              style={style}
              radius={4}
          />
          <Baseline
            key={`baseline-${channelName}`}
            axis={`${channelName}_axis`}
            value={series.avg(channelName, filter.ignoreMissing)}
            label="snitt"
          />
        </Charts>
        <YAxis
          id={`${channelName}_weeklyaxis`}
          min={weeklySeries.min(channelName, filter.ignoreMissing)}
          max={weeklySeries.max(channelName, filter.ignoreMissing)}
          format=".0f"
          width="30"
          type="linear"
        />
        <ValueAxis
          id={`${channelName}_valueaxis`}
          value={value}
          detail={unit}
          width={60}
          min={0}
          max={35}
        />
      </ChartRow>
    )
  }

  render() {
    const channels = ['distance', 'calories', 'duration'];
    const { series } = this.props;
    const { tracker } = this.state;
    if (series.size() < 2) {
      return (
        <div>
          <h2>Analys</h2>
          <em>Inte tillräcklig data för att plotta</em>
        </div>
      );
    }
    return (
      <div>
        <h2>Analys</h2>
        <em>Staplar visar 7-dagars intervall, inte nödvändigtvis från en måndag</em>
        <div className="charts-box">
          <Resizable>
            <ChartContainer
              timeRange={series.range()}
              showGrid={false}
              trackerPosition={tracker}
              onTrackerChanged={this.handleTrackerChanged}
            >
              {channels.map(this.renderChartRow)}
            </ChartContainer>
          </Resizable>
        </div>
      </div>
    )
  }
}
