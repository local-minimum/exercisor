import React from 'react';
import { EVENT_TYPES, EVENT_ICONS } from '../util';
import ToggleBtn from './ToggleBtn';
import Icon from './Icon';

const getEventTypes = (events) => {
  const types = new Set();
  events.forEach(evt => types.add(evt.type == null ? 'CrossTrainer' : evt.type));
  return types;
}

export default function ExerciseTypeFilter({
  events, onToggleFilter, eventTypeFilters = [],
}) {
  const types = getEventTypes(events);
  if (types.size < 2) return null;
  const options = [];
  types
    .forEach(t => options
      .push((
        <ToggleBtn
          key={t}
          toggled={eventTypeFilters.some(f => f === t)}
          name={t}
          onClick={onToggleFilter}
        >
          <Icon type={EVENT_ICONS[t]} inTextButton/>
          {EVENT_TYPES[t]}
        </ToggleBtn>
      )));
  return <div><strong>Filter: </strong>{options}</div>;
}
