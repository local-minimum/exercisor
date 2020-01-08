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
const SEG_TYPE_LINE = 'SEG_TYPE_LINE';
const SEG_TYPE_CONNECTOR = 'SEG_TYPE_CONNECTOR';
const SEG_TYPE_PT = 'SEG_TYPE_PT';
const colDark = '#1c2541';
const colLight = '#3a506b';
const colHighDark = '#ff8c42';
const colHighLight = '#ff3c38';

const lineStyle = new Style({
  stroke: new Stroke({width: 2, color: colDark})
});
const lineStyleHighlight = new Style({
  stroke: new Stroke({width: 3, color: colHighLight})
});
const connectorStyle = new Style({
  stroke: new Stroke({width: 1, color: colLight})
});
const connectorStyleHighlight = new Style({
  stroke: new Stroke({width: 1, color: colHighDark})
});
const legPt = new Style({
  image: new CircleStyle({
    fill: new Fill({color: colDark}),
    radius: 4,
    stroke: new Stroke({width: 1, color: colLight}),
  }),
});
const legPtHighlight = new Style({
  image: new CircleStyle({
    fill: new Fill({color: colHighLight}),
    radius: 5,
    stroke: new Stroke({width: 1, color: colHighDark}),
  }),
});

export default class DistanceOnEarth extends React.Component {
  constructor(props) {
    super(props);

    this.state = { exhausted: false, segment: null, focusMode: 'recent' };

    this.vectorSource = new VectorSource();

    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: (feature) => {
        return feature.get('segment') > 0 ? legPt : null;
      },
    });

    this.olmap = new Map({
      target: null,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 1,
      }),
    });
  }

  getStyle(selected, segType) {
    switch (segType) {
      case SEG_TYPE_PT:
        return selected ? legPtHighlight : legPt;
      case SEG_TYPE_LINE:
        return selected ? lineStyleHighlight : lineStyle;
      case SEG_TYPE_CONNECTOR:
        return selected ? connectorStyleHighlight : connectorStyle;
      default:
        return null;
    }
  }

  getFeatures(data, segment) {
    return data.map((evtData, idx) => {
      const selected = segment === idx + 1;
      if (evtData.length === 0) {
        return [];
      }
      if (evtData.length === 1) {
        const featLine = new Feature({
          geometry: new LineString(evtData[0].map(lonLat => fromLonLat(lonLat))),
          segment: idx + 1,
          name: `Pass ${idx + 1}`,
        });
        featLine.setStyle(this.getStyle(selected, SEG_TYPE_LINE));
        const featPt = new Feature({
          geometry: new Point(fromLonLat(evtData[0][evtData[0].length - 1])),
          segment: idx + 1,
        });
        featPt.setStyle(this.getStyle(selected, SEG_TYPE_PT));
        return [featLine, featPt];
      }
      const feats = [];
      for (let idxPart=0; idxPart<evtData.length - 1; idxPart++) {
        const feat = new Feature({
          geometry: new LineString(evtData[idxPart].map(lonLat => fromLonLat(lonLat))),
          segment: idx + 1,
          name: `Pass ${idx + 1}, del ${idxPart + 1}`,
        });
        feat.setStyle(this.getStyle(selected, SEG_TYPE_LINE));
        feats.push(feat);
        const connector = new Feature({
          geometry: new LineString([
            fromLonLat(evtData[idxPart][evtData[idxPart].length - 1]),
            fromLonLat(evtData[idxPart + 1][1]),
          ]),
          segment: idx + 1,
          name: `Pass ${idx + 1}, teleportering ${idxPart + 1}`,
        });
        connector.setStyle(this.getStyle(selected, SEG_TYPE_CONNECTOR));
        feats.push(connector);
      }
      const lastLine = evtData[evtData.length - 1]
      const feat = new Feature({
        geometry: new LineString(lastLine.map(lonLat => fromLonLat(lonLat))),
        segment: idx + 1,
        name: `Pass ${idx + 1}, del ${evtData.length}`,
      });
      feat.setStyle(this.getStyle(SEG_TYPE_LINE));
      feats.push(feat);
      const featPt = new Feature({
        geometry: new Point(fromLonLat(lastLine[lastLine.length - 1])),
        segment: idx + 1,
      });
      featPt.setStyle(this.getStyle(selected, SEG_TYPE_PT));
      feats.push(featPt);
      return feats;
    }).flat()
  }

  render() {
    const { exhausted, segment } = this.state;
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
    const Segment = segment && (
      <div className="map-segment-info">
        <div className="map-segment-info-inner">
          <h3>Pass {segment}</h3>
          <span>{events[events.length - segment].date}</span>
        </div>
      </div>
    );
    return (
      <div>
        <h2>Tillryggalagd sträcka</h2>
        <em>{intro}</em>
        <div id="map" style={mapStyle} />
        {Segment}
        <div>
          <strong>Fokusera på: </strong>
          <button onClick={() => this.setFocus('recent')}>Senaste passet</button>
          <button onClick={() => this.setFocus('all')}>Alla pass</button>
        </div>
      </div>
    );
  }

  handleMapClick = (evt) => {
    const { coordinate } = evt;
    const feat = this.vectorSource.getClosestFeatureToCoordinate(coordinate);
    const seg = feat == null ? null : feat.get('segment');
    this.setState({segment: seg === this.state.segment ? null : seg});
  }

  componentDidMount() {
    this.olmap.setTarget("map");
    this.olmap.on('click', this.handleMapClick)
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

  setFocusIfLoading = () => {
    const { focusMode, exhausted } = this.state;
    if (!exhausted) this.setFocus(focusMode);
  }

  setFocus = (focusMode) => {
    if (focusMode === 'all') {
      const extent = this.vectorSource.getExtent();
      this.olmap.getView().fit(extent);
      this.olmap.getView().adjustZoom(-1);
      if (this.state.focusMode !== focusMode) this.setState({focusMode});
    } else if (focusMode === 'recent') {
      const feat = this.vectorSource.getFeatures()
        .reduce(
          (acc, feat) => {
            if (acc == null) return feat;
            return acc.get('segment') > feat.get('segment') ? acc : feat;
          },
          null,
        );
      if (feat != null) {
          this.olmap.getView().fit(feat.getGeometry().getExtent());
          this.olmap.getView().setZoom(9);
      }
      if (this.state.focusMode !== focusMode) this.setState({focusMode});
    }
  }

  refreshVectors() {
    const { events } = this.props;
    const { segment } = this.state;
    const {lines, exhausted} = getLineStringsData(events, waypoints, this.getRoute);
    this.vectorSource.clear()
    if (lines.length > 0) {
      const features = this.getFeatures(lines, segment);
      this.vectorSource.addFeatures(features);
      this.setFocusIfLoading();
    }
    if (this.state.exhausted !== exhausted) this.setState({exhausted});
  }

  loadNextRoute = () => {
    const {onLoadRoute} = this.props;
    const {exhausted} = this.state;
    if (exhausted) {
      return;
    };
    const loading = waypoints.some((wptPair, idx) => {
        if (wptPair != null && this.getRoute(wptPair) == null) {
          onLoadRoute(wptPair[0], wptPair[1]);
          setTimeout(this.loadNextRoute, 2000);
          return true;
        }
        return false;
    });
    if (!loading) this.setState({exhausted: true});
  }
};
