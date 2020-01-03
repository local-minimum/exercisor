import React from 'react';
import './ExerciseView.css'

class ExerciseView extends React.Component {
  componentDidMount() {
    const { onReloadUser, name } = this.props;
    onReloadUser(name, null);
  }

  componentDidUpdate() {
    const { userOutOfSync, onReloadUser, name } = this.props;
    if (userOutOfSync) onReloadUser(name, null);
  }

  renderYear(year, count) {
      return (
        <span className="year-summary" key={year}><strong>{year}</strong> ({count})</span>
      )
  }

  renderSummary() {
      const { events, years } = this.props;
      const yearsSpans = Object
        .entries(years)
        .map(([year, count]) => this.renderYear(year, count));

      const oneDay = 1000 * 60 * 60 * 24;
      const stats = {distance: 0, events: events.length, periodStart: null, periodEnd: null};
      events.forEach(evt => {
        stats.distance = stats.distance += (evt.distance == null ? 0 : evt.distance);
        const timestamp = new Date(evt.date).getTime();
        stats.periodStart = stats.periodStart == null ? timestamp : Math.min(stats.periodStart, timestamp);
        stats.periodEnd = stats.periodEnd == null ? timestamp : Math.max(stats.periodEnd, timestamp);
      });
      const timeSpan = stats.periodStart != null ? Math.floor((stats.periodEnd - stats.periodStart) / oneDay) + 1 : 0;
      const perWeek = timeSpan === 0 ? "0" : (stats.events / timeSpan * 7).toFixed(2);
      return (
        <div>
          <h2>Sammanställning</h2>
          <div>{yearsSpans}</div>
          <div>Totalt {stats.distance.toFixed(0)} km och {stats.events} pass. Hållt på i {timeSpan} dagar, {perWeek} pass i veckan.</div>
        </div>
      );
  }

  renderTableRow(event, onSetEntry, onRemoveEntry, canEdit) {
    const btns = canEdit &&
      <span>
        <input className='action-btn' type='button' value='E' tooltip='Editera' onClick={() => onSetEntry(event)}/>
        <input className='action-btn' type='button' value='X' tooltip='Ta Bort' onClick={() => onRemoveEntry(event.id)}/>
      </span>;
    return (
      <tr key={event.id}>
        <td>{event.date} {btns}</td>
        <td>{event.distance}</td>
        <td>{event.duration}</td>
        <td>{event.calories}</td>
        <td>CrossTrainer</td>
      </tr>
    )
  }

  renderTable() {
      const {
        events,
        onEntryDate, onEntryCalories, onEntryDistance, onEntryDuration,
        entry, onSave, onSetEditKey, editKey, onSetEntry, onRemoveEntry,
        settings, onListAll,
      } = this.props;
      const eventRows = events
        .slice(0, settings.listAll ? events.length : 5)
        .map(evt => this.renderTableRow(evt, onSetEntry, onRemoveEntry, editKey.length > 0));
      const canSave = entry.date.length > 0 && (entry.duration.length > 0 || entry.distance.length > 0 || entry.calories.length > 0);
      const saveBtn = canSave ? <input type='button' className='small-input' value="Spara" onClick={onSave}/> : null;
      const viewModeBtn = <input
        type="button"
        value={settings.listAll ? "Visa bara senaste" : "Visa alla"}
        onClick={() => onListAll(!settings.listAll)}
      />;
      return (
        <div>
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Distans [km]</th>
                <th>Tid [min]</th>
                <th>Kalorier</th>
                <th>Typ</th>
              </tr>
            </thead>
            <tbody>
              {eventRows}
            </tbody>
            <tfoot>
              {editKey !== "" &&
                <tr>
                  <td><input type='date' onChange={evt => onEntryDate(evt.target.value)} value={entry.date}/></td>
                  <td><input type='text' className='small-input' onChange={evt => onEntryDistance(evt.target.value)} value={entry.distance}/></td>
                  <td><input type='text' className='small-input' onChange={evt => onEntryDuration(evt.target.value)} value={entry.duration}/></td>
                  <td><input type='text' className='small-input' onChange={evt => onEntryCalories(evt.target.value)} value={entry.calories}/></td>
                  <td>{saveBtn}</td>
                </tr>
              }
              <tr>
                <td colSpan={2}>Edit Key: <input type="password" value={editKey} onChange={evt => onSetEditKey(evt.target.value)}/></td>
              </tr>
            </tfoot>
          </table>
          {viewModeBtn}
        </div>
      );
  }

  render() {
    return <div className="App-main-item">
      {this.renderSummary()}
      {this.renderTable()}
    </div>;
  }
}

export default ExerciseView;
