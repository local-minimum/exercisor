import React from 'react';
import {Point, LineString} from 'ol/geom';
import Map from 'ol/Map';
import {Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import View from 'ol/View';
import Feature from 'ol/Feature';
import {Stroke, Style, Circle as CircleStyle, Fill} from 'ol/style';
import {fromLonLat} from 'ol/proj';
import 'ol/ol.css';

const waypoints = [
    ["Västra Bodarnevägen, Alingsås", "Örgrytemotet, Heden, Göteborg"],
    ["Örgrytemotet, Heden, Göteborg", "Tårnby, Tårnbytunnelen/Øresundsmotorvejen"]
];

function lerpPositionsToCoord(from, to, fraction) {
  const factor = Math.min(1, Math.max(fraction, 0));
  const dLat = to.lat - from.lat;
  const dLon = to.lon - from.lon;
  const angle = Math.atan2(dLat, dLon);
  const length = Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2));
  const nextLength = factor * length
  return [
    from.lon + nextLength * Math.cos(angle),
    from.lat + nextLength * Math.sin(angle),
  ];
}

const lineStyle = new Style({stroke: new Stroke({width: 2, color: 'blue'})});
const connectorStyle = new Style({stroke: new Stroke({width: 1, color: 'lightblue'})});
const legPt = new Style({
  image: new CircleStyle({
    fill: new Fill({color: 'blue'}),
    radius: 4,
    stroke: new Stroke({width: 1, color: 'lightblue'}),
  }),
});

export default class DistanceOnEarth extends React.Component {
  constructor(props) {
    super(props);

    this.state = { exhausted: false };

    this.vectorSource = new VectorSource();
    this.olmap = new Map({
      target: null,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: this.vectorSource,
          style: (feature) => {
            return feature.get('segment') > 0 ? legPt : null;
          },
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 1,
      }),
    });
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
      coords.push([legStart.lon, legStart.lat]);
      route
        .some((leg, idxLeg) => {
          if (idxLeg < idxStartLeg) return false;
          if (leg.distance <= eventRemaining) {
            // We need entire leg an probably more
            if (leg.lon !== coords[0][0] && leg.lat !== coords[0][1]) coords.push([leg.lon, leg.lat]);
            eventRemaining -= leg.distance;
            endFraction = 0
            idxEndLeg = idxLeg + 1;
            return eventRemaining === 0;
          } else {
            // The leg is larger than we need
            endFraction = startFraction + eventRemaining / leg.distance;
            if (endFraction > 1) {
              // But we had used up so much we actually need more
              coords.push([leg.lon, leg.lat]);
              eventRemaining -= (1 - startFraction) * leg.distance;
              endFraction = 0
              startFraction = 0
              idxEndLeg = idxLeg + 1;
              return false;
            } else {
              // We just need a part of the leg
              coords.push(lerpPositionsToCoord(
                idxLeg === 0 ? legStart: route[idxLeg - 1],
                leg,
                endFraction,
              ));
              eventRemaining = 0;
              idxEndLeg = idxLeg;
              return eventRemaining === 0;
            }
          }
        });
      return {
        coords, eventRemaining, idxEndLeg, endFraction,
      };
  }

  getLineStringsData() {
    const events = this.props.events.slice().reverse();
    let idxWaypointPair = 0;
    const lines = [];

    let exhausted = true;
    let idxStartLeg = 0;
    let startFraction = 0;
    let legStart = null;
    for (let idxEvent=0; idxEvent<events.length; idxEvent++) {
      lines.push([]);
      let distance = events[idxEvent].distance * 1000;
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
          legStart,
        );
        lines[idxEvent].push(coords);
        idxStartLeg = idxEndLeg;
        startFraction = endFraction;
        distance = eventRemaining;
        legStart = {
          lon: coords[coords.length - 1][0],
          lat: coords[coords.length - 1][1],
          distance: 0,
        };
        if (distance > 0) {
          idxWaypointPair += 1;
          startFraction = 0;
          idxStartLeg = 0;
        }
      }
    }
    return {lines: lines.filter(evtLines => evtLines.length > 0), exhausted};
  }

  getFeatures(data) {
    return data.map((evtData, idx) => {
      if (evtData.length === 0) {
        return [];
      }
      if (evtData.length === 1) {
        const featLine = new Feature({
          geometry: new LineString(evtData[0].map(lonLat => fromLonLat(lonLat))),
          name: `Pass ${idx + 1}`,
        });
        featLine.setStyle(lineStyle);
        const featPt = new Feature({
          geometry: new Point(fromLonLat(evtData[0][evtData[0].length - 1])),
          segment: idx + 1,
        });
        return [featLine, featPt];
      }
      const feats = [];
      for (let idxPart=0; idxPart<evtData.length - 1; idxPart++) {
        const feat = new Feature({
          geometry: new LineString(evtData[idxPart].map(lonLat => fromLonLat(lonLat))),
          name: `Pass ${idx + 1}, del ${idxPart + 1}`,
        });
        feat.setStyle(lineStyle);
        feats.push(feat);
        const connector = new Feature({
          geometry: new LineString([
            fromLonLat(evtData[idxPart][evtData[idxPart].length - 1]),
            fromLonLat(evtData[idxPart + 1][1]),
          ]),
          name: `Pass ${idx + 1}, teleportering ${idxPart + 1}`,
        });
        connector.setStyle(connectorStyle);
        feats.push(connector);
      }
      const feat =new Feature({
        geometry: new LineString(evtData[evtData.length - 1].map(lonLat => fromLonLat(lonLat))),
        name: `Pass ${idx + 1}, del ${evtData.length}`,
      });
      feat.setStyle(lineStyle);
      feats.push(feat);
      const featPt = new Feature({
        geometry: new Point(fromLonLat(evtData[0][evtData[0].length - 1])),
        segment: idx + 1,
      });
      feats.push(featPt);
      return feats;
    }).flat()
  }

  render() {
    const { exhausted } = this.state;
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
    const intro = exhausted ? 'Varje segment är ett träningspass' : 'Laddar...';
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
    this.refreshVectors();
  }

  refreshVectors() {
    const {lines, exhausted} = this.getLineStringsData();
    this.vectorSource.clear()
    if (lines.length > 0) {
      const features = this.getFeatures(lines);
      this.vectorSource.addFeatures(features);
      const extent = this.vectorSource.getExtent();
      this.olmap.getView().fit(extent);
      this.olmap.getView().adjustZoom(-1);
    }
    if (this.state.exhausted !== exhausted) this.setState({exhausted});
  }

  loadNextRoute = () => {
    const {onLoadRoute} = this.props;
    const {exhausted} = this.state;
    if (exhausted) {
      return;
    };
    waypoints.some((wptPair, idx) => {
        if (wptPair != null && this.getRoute(wptPair) == null) {
          onLoadRoute(wptPair[0], wptPair[1]);
          setTimeout(this.loadNextRoute, 2000);
          return true;
        }
        return false;
    });
  }
};
