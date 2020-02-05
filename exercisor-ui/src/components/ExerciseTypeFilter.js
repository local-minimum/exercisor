import React from 'react';
import { EVENT_TYPES } from '../util';
import ToggleBtn from './ToggleBtn';

const getEventTypes = (events) => {
  const types = new Set();
  events.forEach(evt => types.add(evt.type == null ? 'CrossTrainer' : evt.type));
  return types;
}

export default function ExerciseTypeFilter({
  events, onToggleFilter, eventTypeFilters = [],
}) {
  const types = getEventTypes(events);
  if (types.size === 0) return null;
  const options = [];
  types
    .forEach(t => options
      .push((
        <ToggleBtn
          toggled={eventTypeFilters.some(f => f === t)}
          name={t}
          onClick={onToggleFilter}
        >
          {EVENT_TYPES[t]}
        </ToggleBtn>
      )));
  return <div><strong>Filter: </strong>{options}</div>;
}
