import React from 'react';
import { minutes2str, EVENT_TYPES, EVENT_ICONS } from '../util';
import Error from './Error';
import Icon from './Icon';
import { EXERCISE_TABLE_ERROR } from '../errors';

function renderTableRow(event, onSetEntry, onRemoveEntry, canEdit) {
  const btns = canEdit &&
    <span>
      <div className='action-btn buttonized' tooltip='Editera' onClick={() => onSetEntry(event)}><Icon type="edit"/></div>
      <div className='action-btn buttonized' tooltip='Ta Bort' onClick={() => onRemoveEntry(event.id)}><Icon type="delete"/></div>
    </span>;
  const typeText = EVENT_TYPES[event.type] == null ? event.type : EVENT_TYPES[event.type];
  const typeIcon = <Icon type={EVENT_ICONS[event.type]} title={typeText} />
  return (
    <tr key={event.id}>
      <td>{event.date} {btns}</td>
      <td>{event.distance}</td>
      <td>{minutes2str(event.duration)}</td>
      <td>{event.calories}</td>
      <td>{typeIcon != null ? typeIcon : typeText}</td>
    </tr>
  )
}

export default function ExerciseTable({
    events, error,
    onEntryDate, onEntryCalories, onEntryDistance, onEntryDuration,
    entry, onSave, onSetEntry, onRemoveEntry,
    settings, onListAll, onEntryType, editMode
  }) {
  const eventRows = events
    .slice(0, settings.listAll ? events.length : 5)
    .map(evt => renderTableRow(evt, onSetEntry, onRemoveEntry, editMode));
  const canSave = entry.date.length > 0 && (entry.duration.length > 0 || entry.distance.length > 0 || entry.calories.length > 0);
  const hasEntered = entry.date.length > 0 || entry.duration.length > 0 || entry.distance.length > 0 || entry.calories.length > 0;
  const saveBtn = canSave ?
    (
      <div className="pill buttonized" onClick={onSave}>
        <Icon type="save" inTextButton/>Spara  
      </div>
    ) :
    <span>{hasEntered ? "Måste fylla i datum och minst ett värde." : "Fyll i alla fält och tryck sedan på spara."}</span>;
  const viewModeBtn = (
    <div className="buttonized pill" onClick={() => onListAll(!settings.listAll)}>
      <Icon type={settings.listAll ? 'collapse' : 'expand'} inTextButton/>
      {settings.listAll ? "Lista 5 senaste" : "Lista alla"}
    </div>
  );
  return (
    <div>
      <h2>Motionspass</h2>
      <Error error={error} targetFilter={EXERCISE_TABLE_ERROR} />
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>km</th>
            <th>hh:mm</th>
            <th>kcal</th>
            <th>Typ</th>
          </tr>
        </thead>
        <tbody>
          {eventRows}
        </tbody>
        <tfoot>
          {editMode &&
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
          {editMode &&
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
