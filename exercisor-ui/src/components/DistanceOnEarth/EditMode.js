import React from 'react';
import { Point, LineString } from 'ol/geom';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';

import AnyModeBase, { DEFAULT_ROUTE }  from './AnyModeBase';
import MapBox from './MapBox';
import { getStyle, SEG_TYPE_PT, SEG_TYPE_LINE, SEG_TYPE_CONNECTOR, legNoPt } from './styles';
import { emptyOrNull } from '../../util';
import { EXERCISE_MAP_ERROR } from '../../errors';
import Error from '../Error';

export default class DoEEditMode extends AnyModeBase {

  handleChangeRouteDesign = (evt) => {
    const { onSetRouteDesignConsidered } = this.props;
    const { value } = evt.target;
    this.setState({ showOnMap: false, editModeSelect: true }, () => onSetRouteDesignConsidered(value));
  }

  handleClickShow = () => {
    this.setState({ showOnMap: !this.state.showOnMap });
  }

  handleSaveSelected = () => {
    const { routeId, year, onSetSelectedRoute } = this.props;
    onSetSelectedRoute(routeId, year);
  }

  handleEditSelected = () => {
    const { routeId } = this.props;
    const designRoute = this.getRouteFromId(routeId);
    if (designRoute == null) return;

    this.setState({
      renderMakeNew: true,
      showOnMap: true,
      designRoute: designRoute.waypoints,
      designRouteName: designRoute.name,
      designRouteId: designRoute.id,
    });
  }

  renderSelect() {
    const { routeId, ownRouteDesigns, allRouteDesigns } = this.props;
    const { showOnMap } = this.state;
    const OwnRoutes = ownRouteDesigns
      .map(design => <option key={design.id} value={design.id}>{design.name}</option>);
    const OthersRoutes = allRouteDesigns
      .filter(design => !ownRouteDesigns.some(own => own.id === design.id))
      .map(design => <option key={design.id} value={design.id}>{design.name}</option>);
    const ViewOnMap = <button onClick={this.handleClickShow}>{showOnMap ? 'Dölj rutt' : 'Visa på kartan'}</button>
    const Save = <button onClick={this.handleSaveSelected}>Välj</button>
    const Edit = <button onClick={this.handleEditSelected}>Editera</button>
    return (
      <div>
        <select value={emptyOrNull(routeId) ? "" : routeId} onChange={this.handleChangeRouteDesign}>
          <option value="">-- Inget valt --</option>
          {OwnRoutes}
          {OthersRoutes}
        </select>
        {Save}
        {Edit}
        {ViewOnMap}
      </div>
    );
  }

  handleShowDesign = (idx) => {
    const { onLoadRoute } = this.props;
    const { designRoute } = this.state;
    const [fromPt, toPt] = designRoute[idx];
    onLoadRoute(fromPt.length > 0 ? fromPt : null, toPt.length > 0 ? toPt : null);
  }

  handleChangeDesign = (idx, value) => {
    const { designRoute } = this.state;

    this.setState({
      designRoute: designRoute
        .slice(0, idx)
        .concat([value])
        .concat(designRoute.slice(idx + 1, designRoute.length))
    });
  }

  handleChangeDesignName = (evt) => {
    this.setState({
      designRouteName: evt.target.value,
    });
  }

  handleRemoveDesignStep = (idx) => {
    const { designRoute } = this.state;

    this.setState({
      designRoute: designRoute
        .slice(0, idx)
        .concat(designRoute.slice(idx + 1, designRoute.length))
    });
  }

  renderDesignRow = (data, idx) => {
    const dist = this.getWptDistance(data);
    return (
      <tr key={`row-${idx}`}>
        <td>
          <input
            type="text"
            value={data[0] == null ? "" : data[0]}
            onChange={(evt) => this.handleChangeDesign(idx, [evt.target.value, data[1]])}
          />
        </td>
        <td>
          <input
            type="text"
            value={data[1] == null ? "" : data[1]}
            onChange={(evt) => this.handleChangeDesign(idx, [data[0], evt.target.value])}
          />
        </td>
        <td>{dist == null ? '???' : dist.toFixed(0)} km</td>
        <td>
          <button onClick={() => this.handleShowDesign(idx)}>Uppdatera</button>
          <button onClick={() => this.handleRemoveDesignStep(idx)}>Ta bort</button>
        </td>
      </tr>
    );
  }

  addDesignRow = () => {
    const { designRoute } = this.state;
    this.setState({
      designRoute: designRoute
        .concat([[
          designRoute.length === 0 ? "" : designRoute[designRoute.length - 1][1],
          ""
        ]])
    });
  }

  handleSaveClick = () => {
      const { onMakeRoute, onUpdateRoute } = this.props;
      const { designRoute, designRouteName, designRouteId } = this.state;
      const waypoints = designRoute
        .filter(wptPair => wptPair[0] !== '' || wptPair[1] !== '');
      if (waypoints.length > 0) {
        if (emptyOrNull(designRouteId)) {
          onMakeRoute(designRouteName, waypoints);
        } else {
          onUpdateRoute(designRouteId, designRouteName, waypoints)
        }
        this.handleSetEditModeSelect();
      } else {
        console.warn("Won't save empty rout", waypoints, designRoute);
      }

  }

  renderCreate() {
    const { designRoute, designRouteName, designRouteId } = this.state;
    const dists = designRoute
      .filter(wptPair => wptPair[0] !== '' || wptPair[1] !== '')
      .map(this.getWptDistance);
    const total = dists.some(d => d == null) ? '???' : dists.reduce((acc, d) => acc + d, 0).toFixed(0);
    const canSave = total !== '???' && total !== '0' && designRouteName != null && designRouteName.length > 0;
    const info = emptyOrNull(designRouteId) ? "Sparas som ny rutt" : "Uppdaterar tidigare rutt";
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Från</th>
              <th>Till</th>
              <th>Avstånd</th>
              <th></th>
            </tr>
            {designRoute.map(this.renderDesignRow)}
            <tr>
              <td><button onClick={this.addDesignRow}>+ Segment</button></td>
              <td></td>
              <td>{total} km</td>
            </tr>
          </tbody>
        </table>
        <em>{info}: </em>
        <input
          type="text"
          placeholder="Namnge rutten"
          onChange={this.handleChangeDesignName}
          value={emptyOrNull(designRouteName) ? '' : designRouteName}
        />
        <button disabled={!canSave} onClick={this.handleSaveClick}>Spara</button>
      </div>
    )
  }

  handleSetEditModeCreate = () => {
    const { designRoute } = this.state;
    this.setState({
      renderMakeNew: true,
      showOnMap: true,
      designRoute: designRoute == null ? [["", ""]] : designRoute,
      designRouteName: null,
    });
  }

  handleSetEditModeSelect = () => {
    this.setState({ renderMakeNew: false, showOnMap: false, designRouteId: '' });
  }

  render() {
    const { year, routeId, error } = this.props;
    const { renderMakeNew, features, exhausted, segment } = this.state;
    const Main = renderMakeNew ? this.renderCreate() : this.renderSelect();
    const segmentInfo = this.getSegmentInfo(routeId);
    return (
      <div>
        <h2>Tillryggalagd sträcka</h2>
        <Error error={error} targetFilter={EXERCISE_MAP_ERROR} />
        <em>
          Välj vilken rutt som ska gälla för {year === 'total' ? 'all tid' : year},
          eller skapa en ny rutt.
        </em>
        <div>
          <button disabled={!renderMakeNew} onClick={this.handleSetEditModeSelect}>Välj rutt</button>
          <button disabled={!!renderMakeNew} onClick={this.handleSetEditModeCreate}>Skapa rutt</button>
        </div>
        {Main}
        <MapBox
          segment={segment == null || segmentInfo == null ? null : `Del ${segment}`}
          segmentInfo={segmentInfo}
          onMapClick={this.handleSelectSegment}
          features={features}
          loading={!exhausted}
          onZoomChange={this.handleZoomChange}
          defaultFocus="all"
        />
      </div>
    );
  }

  routeToFeatures = (routeId) => {
    const { segment, zoom } = this.state;
    const { locations } = this.props;
    const waypoints = this.getWaypointsFromId(routeId);
    if (waypoints == null) return [];
    let exhausted = true;
    const features = []
    const hash = []
    let prevWptEnd = null
    waypoints.forEach((wptPair, idx) => {
      const selected = segment === idx + 1;
      const [from, to] = wptPair;
      if (prevWptEnd != null && prevWptEnd !== from) {
        const prevEndPt = locations[prevWptEnd];
        const fromPt = from === '' ? null : locations[from];
        if (prevEndPt != null && fromPt != null) {
          const connector = new Feature({
            geometry: new LineString([
              fromLonLat([prevEndPt.lon, prevEndPt.lat]),
              fromLonLat([fromPt.lon, fromPt.lat]),
            ]),
            segment: -1,
            name: `Hopp`,
            lastIdx: -1,
          });
          connector.setStyle(getStyle(selected, SEG_TYPE_CONNECTOR));
          features.push(connector);
        }
      }
      prevWptEnd = to;
      const data = this.getRoute(wptPair);
      if (data == null) {
        hash.push(`${from}-${to}`)
        const fromPt = from === '' ? null : locations[from];
        const toPt = to === '' ? null : locations[to];
        if (fromPt != null) {
          const featStartPt = new Feature({
            geometry: new Point(fromLonLat([fromPt.lon, fromPt.lat])),
            lastIdx: idx,
            segment: idx + 1,
          });
          if (zoom == null || zoom > 6) {
            featStartPt.setStyle(getStyle(selected, SEG_TYPE_PT));
          } else {
            featStartPt.setStyle(legNoPt);
          }
          features.push(featStartPt);
        }
        if (fromPt != null && toPt != null) {
          const connector = new Feature({
            geometry: new LineString([
              fromLonLat([fromPt.lon, fromPt.lat]),
              fromLonLat([toPt.lon, toPt.lat]),
            ]),
            segment: idx + 1,
            name: `Ingen rutt`,
            lastIdx: idx + 1,
          });
          connector.setStyle(getStyle(selected, SEG_TYPE_CONNECTOR));
          features.push(connector);

        }
        if (toPt != null) {
          const featEndPt = new Feature({
            geometry: new Point(fromLonLat([toPt.lon, toPt.lat])),
            lastIdx: idx,
            segment: idx + 1,
          });
          if (zoom == null || zoom > 6) {
            featEndPt.setStyle(getStyle(selected, SEG_TYPE_PT));
          } else {
            featEndPt.setStyle(legNoPt);
          }
          features.push(featEndPt);
        }
        exhausted = false;
        return;
      }
      const featStartPt = new Feature({
        geometry: new Point(fromLonLat([data[0].lon, data[0].lat])),
        lastIdx: idx,
        segment: idx + 1,
      });
      if (zoom == null || zoom > 6) {
        featStartPt.setStyle(getStyle(selected, SEG_TYPE_PT));
      } else {
        featStartPt.setStyle(legNoPt);
      }
      const featLine = new Feature({
        geometry: new LineString(data.map(seg => fromLonLat([seg.lon, seg.lat]))),
        segment: idx + 1,
        lastIdx: idx + 1,
        name: `Del ${idx + 1}`,
      });
      featLine.setStyle(getStyle(selected, SEG_TYPE_LINE));
      const featEndPt = new Feature({
        geometry: new Point(fromLonLat([data[data.length - 1].lon, data[data.length - 1].lat])),
        lastIdx: idx,
        segment: idx + 1,
      });
      if (zoom == null || zoom > 6) {
        featEndPt.setStyle(getStyle(selected, SEG_TYPE_PT));
      } else {
        featEndPt.setStyle(legNoPt);
      }
      features.push(featStartPt);
      features.push(featLine);
      features.push(featEndPt);
      return;
    });
    return {features, exhausted, featuresId: hash.join('-')};
  }

  getSegmentInfo = (routeId) => {
    const { segment } = this.state;
    if (segment == null) return null;
    const waypoints = this.getWaypointsFromId(routeId);
    const dist = this.getWptDistance(waypoints[segment - 1]);
    return dist == null ? null : `${dist.toFixed(0)} km`;
  };

  getWptDistance = (wptPair) => {
    const leg = this.getRoute(wptPair);
    if (leg == null) return null;
    return leg.reduce((acc, seg) => acc + seg.distance / 1000, 0);
  }

  getRouteFromId = (routeId) => {
    const { renderMakeNew, designRoute, designRouteName, designRouteId } = this.state;
    const { ownRouteDesigns, allRouteDesigns } = this.props;
    if (renderMakeNew) return { waypoints: designRoute, name: designRouteName, id: designRouteId };
    if (emptyOrNull(routeId)) return { waypoints: DEFAULT_ROUTE, id: '', name: '' };

    const routes = ownRouteDesigns.filter(design => design.id === routeId);
    if (routes.length > 0) return routes[0];

    const routes2 = allRouteDesigns.filter(design => design.id === routeId);
    if (routes2.length > 0) return routes2[0];

    return { waypoints: [], id: '', name: '' };
  }

  getWaypointsFromId = (routeId) => {
    return this.getRouteFromId(routeId).waypoints;
  }

  getFeatures() {
    const { showOnMap, renderMakeNew, designRouteId } = this.state;
    const { routeId } = this.props;
    const { features, exhausted, featuresId } = showOnMap ? this.routeToFeatures(renderMakeNew ? designRouteId : routeId) : { features: [], exhausted: true };
    return { features, exhausted, featuresId: `${featuresId}-${renderMakeNew}` };
  }
}
