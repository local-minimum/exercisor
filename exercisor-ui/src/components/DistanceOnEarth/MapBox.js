import React from 'react';
import Map from 'ol/Map';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import View from 'ol/View';

import { legPt } from './styles';

export default class MapBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focusMode: 'recent',
    };

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
            return acc.get('segment') > feat.get('segment') ? acc : feat;
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
          <h3>{segment}</h3>
          <span>{segmentInfo}</span>
        </div>
      </div>
    );
    return (
      <div>
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
    const { onMapClick } = this.props;
    const { coordinate } = evt;
    const feat = this.vectorSource.getClosestFeatureToCoordinate(coordinate);
    const seg = feat == null ? null : feat.get('segment');
    onMapClick(seg);
  }

  componentDidMount() {
    this.olmap.setTarget("map");
    this.olmap.on('click', this.handleMapClick)
    this.loadRoute();
  }

  componentDidUpdate() {
    this.loadRoute();
  }

  loadRoute() {
    const { focusMode } = this.state;
    const { features, loading } = this.props;
    const nPrevFeatures = this.vectorSource.getFeatures().length
    const nCurrentFeatures = features == null ? -1 : features.length;
    this.vectorSource.clear()
    if (nCurrentFeatures > 0) {
      this.vectorSource.addFeatures(features);
      if (loading || (nCurrentFeatures !== nPrevFeatures && nCurrentFeatures > 0)) this.setFocus(focusMode);
    } else {
        this.olmap.getView().setZoom(2);
    }
  }
}
