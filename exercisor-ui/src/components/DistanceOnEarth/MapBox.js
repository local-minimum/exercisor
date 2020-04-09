import React from 'react';
import Map from 'ol/Map';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import View from 'ol/View';
import Icon from '../Icon';
import { EVENT_ICONS } from '../../util';

export default class MapBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focusMode: null,
      prevZoom: null,
    };

    this.vectorSource = new VectorSource();

    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
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

  setFocus = (focusMode) => {
    if (this.vectorSource.getFeatures().length === 0) return;
    if (focusMode === 'all') {
      const extent = this.vectorSource.getExtent();
      this.olmap.getView().fit(extent);
      this.olmap.getView().adjustZoom(-1);
    } else if (focusMode === 'recent') {
      const feat = this.vectorSource.getFeatures()
        .reduce(
          (acc, feat) => {
            if (acc == null) return feat;
            return acc.get('lastIdx') > feat.get('lastIdx') ? acc : feat;
          },
          null,
        );
      if (feat != null) {
          this.olmap.getView().fit(feat.getGeometry().getExtent());
          this.olmap.getView().setZoom(9);
      }
    }
    if (this.state.focusMode !== focusMode) this.setState({focusMode});
  }
  render() {
    const { segment, segmentInfo } = this.props;
    const mapStyle = { width: "calc(100% - 12)", height: "360px", margin: 6};
    const Segment = segment != null && (
      <div className="map-segment-info">
        <div className="map-segment-info-inner">
          <Icon type={EVENT_ICONS[segmentInfo.type]} />
          <h3>{segmentInfo.date}</h3>
          <span>{segmentInfo.distance.toFixed(0)} km</span>
          <span>{segmentInfo.calories.toFixed(0)} kcal</span>
          <span>{segmentInfo.duration.toFixed(0)} min</span>
        </div>
      </div>
    );
    return (
      <div>
        <div id="map" style={mapStyle} />
        {Segment}
        <div>
          <strong>Fokusera på: </strong>
          <button onClick={() => this.setFocus('recent')}>Senaste</button>
          <button onClick={() => this.setFocus('all')}>Alla</button>
        </div>
      </div>
    );
  }

  handleMapClick = (evt) => {
    const { onMapClick } = this.props;
    const { coordinate } = evt;
    const feat = this.vectorSource.getClosestFeatureToCoordinate(coordinate);
    const seg = feat == null ? null : feat.get('segment');
    onMapClick(seg);
  }

  handleMapMoveEnd = () => {
    const { prevZoom } = this.state;
    const zoom = this.olmap.getView().getZoom();
    if (prevZoom !== zoom) {
        const { onZoomChange } = this.props;
        this.setState({ prevZoom: zoom }, () => onZoomChange ? onZoomChange(zoom) : null);
    }
  }

  componentDidMount() {
    this.olmap.setTarget("map");
    this.olmap.on('click', this.handleMapClick)
    this.olmap.on('moveend', this.handleMapMoveEnd);
    this.loadRoute();
  }

  componentDidUpdate() {
    this.loadRoute();
  }

  loadRoute() {
    const { focusMode } = this.state;
    const { features, loading, defaultFocus } = this.props;
    const nPrevFeatures = this.vectorSource.getFeatures().length
    const nCurrentFeatures = features == null ? -1 : features.length;
    this.vectorSource.clear()
    if (nCurrentFeatures > 0) {
      this.vectorSource.addFeatures(features);
      if (loading || (nCurrentFeatures !== nPrevFeatures && nCurrentFeatures > 0)) {
        this.setFocus(focusMode == null ? (defaultFocus == null ? 'recent' : defaultFocus) : focusMode);
      }
    } else {
      this.olmap.getView().setZoom(2);
    }
  }
}
