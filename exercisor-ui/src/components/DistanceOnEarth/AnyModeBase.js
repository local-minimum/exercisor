import React from 'react';

export const DEFAULT_ROUTE = [
    ["Beaune", "Epernay"],
    ["Epernay", "Aigle"],
    ["Aigle", "Stresa"],
    ["Stresa", "Lenzerheide"],
    ["Lenzerheide", "Innsbruck"],
    ["Innsbruck", "Klagenfurt"],
    ["Klagenfurt", "Trieste"]
];

export default class DoEEditMode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      exhausted: true,
      segment: null,
      viewRouteId: undefined,
      featuresId: null,
      viewRoute: [],
      features: [],
    };
  }

  getRoute = (waypoints) => {
    if (waypoints == null) return null;
    const { routesData } = this.props;
    const froms = routesData[waypoints[0]];
    if (froms == null) return null;
    return froms[waypoints[1]];
  }

  handleSelectSegment = (seg) => {
    this.setState({segment: seg === this.state.segment ? null : seg}, () => {
      const { features } = this.getFeatures();
      this.setState({ features });
    });
  }

  handleZoomChange = (zoom) => {
      this.setState({ zoom }, () => {
        const { features } = this.getFeatures();
        this.setState({ features });
      });
  };

  loadRoute = () => {
    const { onLoadRoute, routeId } = this.props;
    const { viewRouteId, viewRoute } = this.state;
    if (routeId !== viewRouteId) {
      this.setState({
        viewRouteId: routeId,
        featuresId: null,
        exhausted: false,
        viewRoute: [],
        features: [],
      });
      return;
    }
    const { features, exhausted, featuresId } = this.getFeatures();
    const nextState = {};
    let loadCallback = () => {};
    if (features.length !== this.state.features.length || featuresId !== this.state.featuresId) {
      nextState.features = features;
      nextState.exhausted = features.length > 0 ? exhausted : false;
      nextState.featuresId = featuresId;
    } else if (this.state.exhausted) {
      return;
    }
    if (!exhausted) {
      const fullViewRoute = this.getWaypointsFromId(routeId);
      const loading = fullViewRoute.length === 0 || fullViewRoute.some((wptPair, idx) => {
          if (wptPair == null) return false;
          const hasLoadedRoute = this.getRoute(wptPair) != null
          const isInViewRoute = viewRoute.some(pair => pair === wptPair)
          if (!hasLoadedRoute) {
            if (isInViewRoute) return true;
            nextState.viewRoute = nextState.viewRoute == null ? viewRoute.concat([wptPair]) : nextState.viewRoute.concat([wptPair]);
            loadCallback = () => onLoadRoute(wptPair[0], wptPair[1]);
            return true;
          }
          if (!isInViewRoute) {
            nextState.viewRoute = nextState.viewRoute == null ? viewRoute.concat([wptPair]) : nextState.viewRoute.concat([wptPair]);
          }
          return false;
      });
      if (!loading) {
        nextState.exhausted = true;
      }
    }
    if (Object.keys(nextState).length > 0) {
      this.setState(nextState, loadCallback);
    }
  }

  componentDidMount() {
    this.loadRoute();
    this.setState({ exhausted: false });
  }

  componentDidUpdate() {
    this.loadRoute();
  }
}
