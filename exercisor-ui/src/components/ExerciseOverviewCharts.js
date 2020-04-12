import React from 'react';
import {
  ChartContainer, ChartRow, Resizable, Charts, Baseline,
  LabelAxis, ScatterChart, YAxis, BarChart,
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
      decimals: 2,
    },
    calories: {
      label: 'Kalorier [kcal]',
      decimals: 0,
    },
    duration: {
      label: 'Tid [min]',
      decimals: 1,
    }
};

const MODE_2_TITLE = {
  weekly: 'Veckovis analys',
  events: 'Analys av pass',
  both: 'Analys (staplar veckor)',
}

export default class ExerciseOverviewCharts extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tracker: null, mode: 'weekly' };
  }

  handleTrackerChanged = t => this.setState({ tracker: t })
  handleShowWeekly = _ => this.setState({ mode: 'weekly' })
  handleShowEvents = _ => this.setState({ mode: 'events' })
  handleShowBoth = _ => this.setState({ mode: 'both' })

  renderChartRow = channelName => {
    const { mode } = this.state;
    if (mode === 'weekly') return this.renderChartRowWeekly(channelName);    
    if (mode === 'events') return this.renderChartRowEvents(channelName);    
    if (mode === 'both') return this.renderChartRowBoth(channelName);    
  }

  renderChartRowEvents = channelName => {
    const { series } = this.props;
    const { tracker } = this.state;
    const { decimals, label } = settings[channelName];
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
    const summary = [
        { label: "Min", value: series.min(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Max", value: series.max(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Snitt", value: series.avg(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Fokus", value: value },
    ];

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
      </ChartRow>
    )
  }

  renderChartRowWeekly = channelName => {
    const { weeklySeries } = this.props;
    const { tracker } = this.state;
    const { decimals, label } = settings[channelName];
    let value = "--";
    if (tracker) {
      const timerange = weeklySeries.range();
      const approx =
        (+tracker - +timerange.begin()) /
        (+timerange.end() - +timerange.begin());
      const ii = Math.floor(approx * weeklySeries.size());
      const i = weeklySeries.bisect(new Date(tracker), ii);
      const v = i < weeklySeries.size() ? weeklySeries.at(i).get(channelName) : null;
      if (v != null) {
        value = v.toFixed(decimals);
      }
    }
    const summary = [
        { label: "Min", value: weeklySeries.min(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Max", value: weeklySeries.max(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Snitt", value: weeklySeries.avg(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Fokus", value: value },
    ];

    return (
      <ChartRow key={channelName}>
        <LabelAxis
          id={`${channelName}_weeklyaxis`}
          label={label}
          values={summary}
          width={140}
          min={weeklySeries.min(channelName, filter.ignoreMissing)}
          max={weeklySeries.max(channelName, filter.ignoreMissing)}
          format=".0f"
          type="linear"
        />
        <Charts>
          <BarChart
              key={`line-${channelName}`}
              axis={`${channelName}_weeklyaxis`}
              series={weeklySeries}
              columns={[channelName]}
              style={weeklyStyle}
          />
          <Baseline
            key={`baseline-${channelName}`}
            axis={`${channelName}_weeklyaxis`}
            value={weeklySeries.avg(channelName, filter.ignoreMissing)}
            label="snitt"
          />
        </Charts>
      </ChartRow>
    )
  }

  renderChartRowBoth = channelName => {
    const { series, weeklySeries } = this.props;
    const { tracker } = this.state;
    const { decimals, label } = settings[channelName];
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
    const summary = [
        { label: "Min", value: series.min(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Max", value: series.max(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Snitt", value: series.avg(channelName, filter.ignoreMissing).toFixed(decimals) },
        { label: "Fokus", value: value },
    ];

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
      </ChartRow>
    )
  }

  render() {
    const channels = ['distance', 'calories', 'duration'];
    const { series } = this.props;
    const { tracker, mode } = this.state;
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
        <h2>{MODE_2_TITLE[mode]}</h2>
        <div>
          <div className="buttonized pill" onClick={this.handleShowWeekly}>
            Veckovis
          </div>
          <div className="buttonized pill" onClick={this.handleShowEvents}>
            Per pass
          </div>
          <div className="buttonized pill" onClick={this.handleShowBoth}>
            Båda (veckor staplar)
          </div>
        </div>
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
