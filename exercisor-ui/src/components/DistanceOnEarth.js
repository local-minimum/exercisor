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
import { getLineStringsData } from './ol-tools/geom';

const waypoints = [
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
      const lastLine = evtData[evtData.length - 1]
      const feat = new Feature({
        geometry: new LineString(lastLine.map(lonLat => fromLonLat(lonLat))),
        name: `Pass ${idx + 1}, del ${evtData.length}`,
      });
      feat.setStyle(lineStyle);
      feats.push(feat);
      const featPt = new Feature({
        geometry: new Point(fromLonLat(lastLine[lastLine.length - 1])),
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
          <h2>Tillryggalagd sträcka</h2>
          <em>Du har inga träningspass registrerade än...</em>
          <div id="map" style={mapStyle} />
        </div>
      );
    }
    const intro = exhausted ? 'Varje segment är ett träningspass' : 'Laddar...';
    return (
      <div>
        <h2>Tillryggalagd sträcka</h2>
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


  getRoute = (waypoints) => {
    if (waypoints == null) return null;
    const { routes } = this.props;
    const froms = routes[waypoints[0]];
    if (froms == null) return null;
    return froms[waypoints[1]];
  }

  refreshVectors() {
    const { events } = this.props;
    const {lines, exhausted} = getLineStringsData(events, waypoints, this.getRoute);
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
