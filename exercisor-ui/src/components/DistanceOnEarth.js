import React from 'react';
import LineString from 'ol/geom/LineString';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';

const waypoints = [
    ["Alingsås", "Örgrytemotet, Heden, Göteborg"],
    ["Örgrytemotet, Heden, Göteborg", "Tårnby, Tårnbytunnelen/Øresundsmotorvejen"]
];

function lerpPositionsToCoord(from, to, fraction) {
  const factor = Math.min(1, Math.max(fraction, 0));
  return [
    from.lon + factor * (to.lon - from.lon),
    from.lat + factor * (to.lat - from.lat),
  ];
}


export default class DistanceOnEarth extends React.Component {
  constructor(props) {
    super(props);

    this.state = { center: [0, 0], zoom: 1 };

    this.olmap = new Map({
      target: null,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: this.state.center,
        zoom: this.state.zoom,
      }),
    });
  }

  updateMap = () => {
    this.olmap.getView().setCenter(this.state.center);
    this.olmap.getView().setZoom(this.state.zoom);
  }

  getRoute(waypoints) {
    if (waypoints == null) return null;
    const { routes } = this.props;
    const froms = routes[waypoints[0]];
    if (froms == null) return null;
    return froms[waypoints[1]];
  }

  getLineStringData(eventRemaining, route, idxStartLeg, startFraction, legStart) {
      const coords = [];
      if (eventRemaining === 0) return {
        coords, eventRemaining,
        idxEndLeg: idxStartLeg, endFraction: startFraction
      };
      let idxEndLeg = idxStartLeg;
      let endFraction = startFraction;
      route
        .slice(idxStartLeg)
        .some((leg, idxLeg) => {
          if (leg.distance <= eventRemaining) {
            coords.push([leg.lon, leg.lat]);
            eventRemaining -= leg.distance;
            endFraction = 0
            idxEndLeg = idxStartLeg + idxLeg + 1;
            return eventRemaining === 0;
          } else {
            endFraction = eventRemaining / leg.distance
            coords.push(lerpPositionsToCoord(
              idxLeg === 0 ? legStart: route[idxStartLeg + idxLeg - 1],
              leg,
              endFraction,
            ));
            eventRemaining = 0;
            idxEndLeg = idxStartLeg + idxLeg;
            return eventRemaining === 0;
          }
        });
      return {
        coords, eventRemaining, idxEndLeg, endFraction,
      };
  }

  getLineStringsData() {
    const { events } = this.props;
    let idxWaypointPair = 0;
    const lines = [];
    let exhausted = true;
    let idxStartLeg = 0;
    let startFraction = 0;
    let legStart = null;
    for (let idxEvent=0; idxEvent<events.length; idxEvent++) {
      let distance = events[idxEvent].distance;
      while (distance != null && distance > 0) {
        const route = this.getRoute(waypoints[idxWaypointPair])
        if (route == null) {
          exhausted = false;
          break;
        }
        if (legStart == null) legStart = route[0]
        const {coords, eventRemaining, idxEndLeg, endFraction} = this.getLineStringData(
          distance,
          route,
          idxStartLeg,
          startFraction,
        );
        lines.push(coords);
        idxStartLeg = idxEndLeg;
        startFraction = endFraction;
        distance = eventRemaining;
        idxWaypointPair += 1;
      }
    }

    return {lines, exhausted};
  }

  getLineString(data) {

  }

  render() {
    const { events } = this.props;
    const mapStyle = { width: "calc(100% - 12)", height: "360px", margin: 6};
    if (events.length === 0) {
      return (
        <div>
          <h2>Tillryggalagd Sträcka</h2>
          <em>Du har inga träningspass registrerade än...</em>
          <div id="map" style={mapStyle} />
        </div>
      );
    }
    const {lines, exhausted} = this.getLineStringsData();
    const intro = exhausted ? 'Varje segment är ett träningspass' : 'Laddar...';
    console.log(lines);
    return (
      <div>
        <h2>Tillryggalagd Sträcka</h2>
        <em>{intro}</em>
        <div id="map" style={mapStyle} />
      </div>
    );
  }

  componentDidMount() {
    this.olmap.setTarget("map");
    this.loadNextRoute();
  }

  componentDidUpdate() {
    this.loadNextRoute();
  }

  loadNextRoute() {
    //this.props.onLoadRoute(route[0][0], route[0][1]);
  }
};
