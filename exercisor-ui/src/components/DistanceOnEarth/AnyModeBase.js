import React from 'react';

const DEFAULT_ROUTE = [
    [
      "Västra Bodarnevägen, Alingsås",
      "Lindomemotet, Långås, Mölndals kommun",
    ],
    [
      "Lindomemotet, Långås, Mölndals kommun",
      "Tårnby, Tårnbytunnelen/Øresundsmotorvejen",
    ],
    [
      "Tårnby, Tårnbytunnelen/Øresundsmotorvejen",
      "Sønderjyske Motorvej, Seest Østerskov",
    ],
    [
      "Sønderjyske Motorvej, Seest Østerskov",
      "İzmit, Kocaeli, Marmara Region, Turkiet",
    ]
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
    const { routes } = this.props;
    const froms = routes[waypoints[0]];
    if (froms == null) return null;
    return froms[waypoints[1]];
  }

  handleSelectSegment = (seg) => {
    this.setState({segment: seg === this.state.segment ? null : seg}, () => {
      const { features } = this.getFeatures();
      this.setState({ features });
    });
  }

  loadRoute = () => {
    const { onLoadRoute, route, routeId } = this.props;
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
    if (features.length > this.state.features.length || featuresId !== this.state.featuresId) {
      nextState.features = features;
      nextState.exhausted = features.length > 0 ? exhausted : false;
      nextState.featuresId = featuresId;
    } else if (this.state.exhausted) {
      if (Object.keys(nextState).length > 0) {
        this.setState(nextState, loadCallback);
      }
      return;
    }
    if (!exhausted) {
      const fullViewRoute = routeId == null ? DEFAULT_ROUTE : (route == null ? [] : route);
      const loading = fullViewRoute.some((wptPair, idx) => {
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
    if (this.state.exhausted) {
      this.setState({exhausted: false});
    }
  }

  componentDidUpdate() {
    this.loadRoute();
  }
}
