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
      const stats = {distance: 0, events: events.length};
      events.forEach(evt => stats.distance += evt.distance);
      const timeSpan = events.length > 0 ? Math.floor((new Date(events[events.length - 1].date) - new Date(events[0].date)) / oneDay + 1) : 0;
      return (
        <div>
          <h2>Sammanställning</h2>
          <div>{yearsSpans}</div>
          <div>Totalt {stats.distance} km och {stats.events} pass. Hållt på i {timeSpan} dagar, {(stats.events / timeSpan * 7).toFixed(2)} pass i veckan.</div>
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
        entry, onSave, onSetEditKey, editKey, onSetEntry, onRemoveEntry
      } = this.props;
      const eventRows = events
        .slice(Math.max(events.length - 5, 0))
        .reverse()
        .map(evt => this.renderTableRow(evt, onSetEntry, onRemoveEntry, editKey.length > 0));
      const canSave = entry.date.length > 0 && (entry.duration.length > 0 || entry.distance.length > 0 || entry.calories.length > 0);
      const saveBtn = canSave ? <input type='button' className='small-input' value="Spara" onClick={onSave}/> : null;
      return (
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
