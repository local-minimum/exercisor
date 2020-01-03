import React from 'react';
import {
  ChartContainer, ChartRow, Resizable, Charts, LineChart, Baseline,
  LabelAxis, ValueAxis,
  styler,
} from 'react-timeseries-charts';

const style = styler([
    { key: "distance", color: "#47bbbb" },
    { key: "calories", color: "#bb47bb" },
    { key: "duration", color: "#bb4747" },
]);

const baselineStyles = {
  distance: {
    stroke: "steelblue",
    opacity: 0.5,
    width: 0.25
  },
  calories: {
    stroke: "steelblue",
    opacity: 0.5,
    width: 0.25
  },
  duration: {
    stroke: "steelblue",
    opacity: 0.5,
    width: 0.25
  }
};

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
    const { series } = this.props;
    const { tracker } = this.state;
    const { decimals, label, unit } = settings[channelName];
    const summary = [
        { label: "Min", value: series.min(channelName).toFixed(decimals) },
        { label: "Max", value: series.max(channelName).toFixed(decimals) },
        { label: "Snitt", value: series.avg(channelName).toFixed(decimals) }
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
          min={series.min(channelName)}
          max={series.max(channelName)}
          width={140}
          type="linear"
          format=",.1f"
        />
        <Charts>
          <LineChart
              key={`line-${channelName}`}
              axis={`${channelName}_axis`}
              series={series}
              columns={[channelName]}
              style={style}
              breakLine
            />
          <Baseline
            key={`baseline-${channelName}`}
            axis={`${channelName}_axis`}
            style={baselineStyles[channelName]}
            value={series.avg(channelName)}
            label="snitt"
          />
        </Charts>
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
    if (series.range() == null) {
      return (
        <div>Loading...</div>
      );
    }
    return (
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
    )
  }
}
