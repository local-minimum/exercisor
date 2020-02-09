import React from 'react';
import { minutes2str, EVENT_TYPES } from '../util';
import Error from './Error';
import { EXERCISE_TABLE_ERROR } from '../errors';

function renderTableRow(event, onSetEntry, onRemoveEntry, canEdit) {
  const btns = canEdit &&
    <span>
      <input className='action-btn' type='button' value='E' tooltip='Editera' onClick={() => onSetEntry(event)}/>
      <input className='action-btn' type='button' value='X' tooltip='Ta Bort' onClick={() => onRemoveEntry(event.id)}/>
    </span>;
  return (
    <tr key={event.id}>
      <td>{event.date} {btns}</td>
      <td>{event.distance}</td>
      <td>{minutes2str(event.duration)}</td>
      <td>{event.calories}</td>
      <td>{EVENT_TYPES[event.type] == null ? event.type : EVENT_TYPES[event.type]}</td>
    </tr>
  )
}

export default function ExerciseTable({
    events, error,
    onEntryDate, onEntryCalories, onEntryDistance, onEntryDuration,
    entry, onSave, onSetEditKey, onSetEntry, onRemoveEntry,
    settings, onListAll, onEntryType,
  }) {
  const editing = false;
  const eventRows = events
    .slice(0, settings.listAll ? events.length : 5)
    .map(evt => renderTableRow(evt, onSetEntry, onRemoveEntry, editing));
  const canSave = entry.date.length > 0 && (entry.duration.length > 0 || entry.distance.length > 0 || entry.calories.length > 0);
  const hasEntered = entry.date.length > 0 || entry.duration.length > 0 || entry.distance.length > 0 || entry.calories.length > 0;
  const saveBtn = canSave ?
    <input type='button' className='small-input' value="Spara" onClick={onSave}/> :
    <span>{hasEntered ? "Måste fylla i datum och minst ett värde." : "Fyll i alla fält och tryck sedan på spara."}</span>;
  const viewModeBtn = <input
    type="button"
    value={settings.listAll ? "Lista 5 senaste" : "Lista alla"}
    onClick={() => onListAll(!settings.listAll)}
  />;
  return (
    <div>
      <h2>Motionspass</h2>
      <Error error={error} targetFilter={EXERCISE_TABLE_ERROR} />
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Distans <span className="xx-small">[km]</span></th>
            <th>Tid <span className="xx-small">[hh:mm:ss]</span></th>
            <th>Energi <span className="xx-small">[kcal]</span></th>
            <th>Typ</th>
          </tr>
        </thead>
        <tbody>
          {eventRows}
        </tbody>
        <tfoot>
          {editing &&
            <tr>
              <td><input type='date' onChange={evt => onEntryDate(evt.target.value)} value={entry.date}/></td>
              <td><input type='text' className='small-input' onChange={evt => onEntryDistance(evt.target.value)} value={entry.distance}/></td>
              <td><input type='text' className='small-input' onChange={evt => onEntryDuration(evt.target.value)} value={entry.duration}/></td>
              <td><input type='text' className='small-input' onChange={evt => onEntryCalories(evt.target.value)} value={entry.calories}/></td>
              <td>
                <select onChange={evt => onEntryType(evt.target.value)} value={entry.type}>
                  {Object.entries(EVENT_TYPES).map(([key, name]) => <option value={key} key={key}>{name}</option>)}
                </select>
              </td>
            </tr>
          }
          {editing &&
            <tr>
              <td colSpan={3}>{saveBtn}</td>
            </tr>
          }
        </tfoot>
      </table>
      {viewModeBtn}
    </div>
  );
}
