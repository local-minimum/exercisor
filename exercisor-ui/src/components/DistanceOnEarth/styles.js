import {Stroke, Style, Circle as CircleStyle, Fill} from 'ol/style';

export const SEG_TYPE_LINE = 'SEG_TYPE_LINE';
export const SEG_TYPE_CONNECTOR = 'SEG_TYPE_CONNECTOR';
export const SEG_TYPE_PT = 'SEG_TYPE_PT';

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
export const legPt = new Style({
  image: new CircleStyle({
    fill: new Fill({color: colDark}),
    radius: 4,
    stroke: new Stroke({width: 1, color: colLight}),
  }),
});
export const legNoPt = new Style({
  image: new CircleStyle({
    radius: 0,
  }),
});

const legPtHighlight = new Style({
  image: new CircleStyle({
    fill: new Fill({color: colHighLight}),
    radius: 5,
    stroke: new Stroke({width: 1, color: colHighDark}),
  }),
});

export function getStyle(selected, segType) {
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
