import React from 'react';

const minutes2str = (minutes) => {
    const whole = Math.floor(minutes);
    if (minutes === whole) {
        return `${minutes}`;
    }
    const seconds = Math.round((minutes - whole) * 60);
    return `${whole}:${seconds}`;
}

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
      <td>CrossTrainer</td>
    </tr>
  )
}

export default function ExerciseTable({
    events,
    onEntryDate, onEntryCalories, onEntryDistance, onEntryDuration,
    entry, onSave, onSetEditKey, editKey, onSetEntry, onRemoveEntry,
    settings, onListAll,
  }) {
  const eventRows = events
    .slice(0, settings.listAll ? events.length : 5)
    .map(evt => renderTableRow(evt, onSetEntry, onRemoveEntry, editKey.length > 0));
  const canSave = entry.date.length > 0 && (entry.duration.length > 0 || entry.distance.length > 0 || entry.calories.length > 0);
  const saveBtn = canSave ? <input type='button' className='small-input' value="Spara" onClick={onSave}/> : null;
  const viewModeBtn = <input
    type="button"
    value={settings.listAll ? "Lista 5 senaste" : "Lista alla"}
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
            <th>Energi [kcal]</th>
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
        </tfoot>
      </table>
      {viewModeBtn}
    </div>
  );
}
