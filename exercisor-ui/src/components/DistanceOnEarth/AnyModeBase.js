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
    this.setState({segment: seg === this.state.segment ? null : seg});
  }

  loadRoute = () => {
    const { onLoadRoute, route, routeId } = this.props;
    const { viewRouteId, viewRoute } = this.state;
    if (routeId !== viewRouteId) {
      this.setState({
        viewRouteId: routeId,
        exhausted: false,
        viewRoute: [],
        features: [],
      });
      return;
    }
    const { features, exhausted } = this.getFeatures();
    const nextState = {};
    let loadCallback = () => {};
    if (features.length > this.state.features.length) {
      nextState.features = features;
      nextState.exhausted = exhausted;
    } else if (this.state.exhausted) {
      if (Object.keys(nextState).length > 0) {
        console.log("early", nextState, loadCallback);
        this.setState(nextState, loadCallback);
      }
      return;
    }
    if (!exhausted) {
      const fullViewRoute = routeId == null ? DEFAULT_ROUTE : (route == null ? [] : route);
      const loading = fullViewRoute.some((wptPair, idx) => {
          if (wptPair != null && this.getRoute(wptPair) == null) {
            if (viewRoute.some(pair => pair === wptPair)) return true;
            nextState.viewRoute = viewRoute.concat([wptPair]);
            loadCallback = () => onLoadRoute(wptPair[0], wptPair[1]);
            return true;
          }
          return false;
      });
      if (!loading) {
        console.log("No more to load");
        nextState.exhausted = true;
      }
    }
    if (Object.keys(nextState).length > 0) {
      console.log(nextState, loadCallback);
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
