import React from 'react';
import { Point, LineString } from 'ol/geom';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

import { getLineStringsData } from './ol-tools/geom';
import AnyModeBase from './AnyModeBase';
import MapBox from './MapBox';
import { getStyle, SEG_TYPE_PT, SEG_TYPE_LINE, SEG_TYPE_CONNECTOR } from './styles';

export default class DoEViewMode extends AnyModeBase {

  getFeaturesFromEvents(data, segment) {
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
        featLine.setStyle(getStyle(selected, SEG_TYPE_LINE));
        const featPt = new Feature({
          geometry: new Point(fromLonLat(evtData[0][evtData[0].length - 1])),
          segment: idx + 1,
        });
        featPt.setStyle(getStyle(selected, SEG_TYPE_PT));
        return [featLine, featPt];
      }
      const feats = [];
      for (let idxPart=0; idxPart<evtData.length - 1; idxPart++) {
        const feat = new Feature({
          geometry: new LineString(evtData[idxPart].map(lonLat => fromLonLat(lonLat))),
          segment: idx + 1,
          name: `Pass ${idx + 1}, del ${idxPart + 1}`,
        });
        feat.setStyle(getStyle(selected, SEG_TYPE_LINE));
        feats.push(feat);
        const lastPt = evtData[idxPart][evtData[idxPart].length - 1];
        const nextPt = evtData[idxPart + 1][0];
        if (lastPt[0] !== nextPt[0] || lastPt[1] !== nextPt[1]) {
          const connector = new Feature({
            geometry: new LineString([
              fromLonLat(lastPt),
              fromLonLat(nextPt),
            ]),
            segment: idx + 1,
            name: `Pass ${idx + 1}, teleportering ${idxPart + 1}`,
          });
          connector.setStyle(getStyle(selected, SEG_TYPE_CONNECTOR));
          feats.push(connector);
        }
      }
      const lastLine = evtData[evtData.length - 1]
      const feat = new Feature({
        geometry: new LineString(lastLine.map(lonLat => fromLonLat(lonLat))),
        segment: idx + 1,
        name: `Pass ${idx + 1}, del ${evtData.length}`,
      });
      feat.setStyle(getStyle(selected, SEG_TYPE_LINE));
      feats.push(feat);
      const featPt = new Feature({
        geometry: new Point(fromLonLat(lastLine[lastLine.length - 1])),
        segment: idx + 1,
      });
      featPt.setStyle(getStyle(selected, SEG_TYPE_PT));
      feats.push(featPt);
      return feats;
    }).flat();
  }

  render() {
    const { exhausted, segment, features } = this.state;
    const { events } = this.props;
    if (events.length === 0) {
      return (
        <div>
          <h2>Tillryggalagd sträcka</h2>
          <em>Du har inga träningspass registrerade än...</em>
        </div>
      );
    }
    const intro = exhausted ? 'Varje segment är ett träningspass' : 'Laddar...';
    const segmentInfo = segment && events[events.length - segment].date;
    return (
      <div>
        <h2>Tillryggalagd sträcka</h2>
        <em>{intro}</em>
        <MapBox
          segment={segment == null ? null : `Pass ${segment}`}
          segmentInfo={segmentInfo}
          onMapClick={this.handleSelectSegment}
          features={features}
          loading={exhausted}
        />
      </div>
    );
  }

  getFeatures() {
    const { events } = this.props;
    const { segment, viewRoute } = this.state;
    const { lines, exhausted } = getLineStringsData(events, viewRoute, this.getRoute);
    return { features: this.getFeaturesFromEvents(lines, segment), exhausted };
  }
};
