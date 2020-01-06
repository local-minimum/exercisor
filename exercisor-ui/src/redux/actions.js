function makeActionCreator(type, ...argNames) {
  return function(...args) {
    const action = { type };
    argNames.forEach((_, index) => {
      action[argNames[index]] = args[index]
    });
    return action;
  }
}

export const SET_NAME = 'SET_NAME';
export const SET_EVENTS = 'SET_EVENTS';
export const SET_YEARS = 'SET_YEARS';
export const CLEAR_ENTRY = 'CLEAR_ENTRY';
export const SET_ENTRY_DATE = 'SET_ENTRY_DATE';
export const SET_ENTRY_DISTANCE = 'SET_ENTRY_DISTANCE';
export const SET_ENTRY_DURATION = 'SET_ENTRY_DURATION';
export const SET_ENTRY_CALORIES = 'SET_ENTRY_CALORIES';
export const SET_ENTRY_TYPE = 'SET_ENTRY_TYPE';
export const SET_ENTRY = 'SET_ENTRY';
export const SET_EDITKEY = 'SET_EDITKEY';
export const SETTING_LISTALL = 'SETTING_LISTALL';
export const SET_GOALS = 'SET_GOALS';
export const SET_GOALS_EVENTSSUM = 'SET_GOALS_EVENTSSUM';
export const SET_OSM_LOCATION = 'SET_OSM_LOCATION';
export const SET_OSM_ROUTE = 'SET_OSM_ROUTE';

export const settingListAll = makeActionCreator(SETTING_LISTALL, 'value');
export const setName = makeActionCreator(SET_NAME, 'name');
export const setEvents = makeActionCreator(SET_EVENTS, 'events');
export const setYears = makeActionCreator(SET_YEARS, 'years');
export const setEntryDate = makeActionCreator(SET_ENTRY_DATE , 'date');
export const setEntryDuration = makeActionCreator(SET_ENTRY_DURATION, 'duration');
export const setEntryDistance = makeActionCreator(SET_ENTRY_DISTANCE, 'distance');
export const setEntryCalories = makeActionCreator(SET_ENTRY_CALORIES, 'calories');
export const setEntryType = makeActionCreator(SET_ENTRY_TYPE, 'eventType');
export const setEntry = makeActionCreator(SET_ENTRY, 'entry');
export const clearEntry = makeActionCreator(CLEAR_ENTRY);
export const setEditKey = makeActionCreator(SET_EDITKEY, 'key');
export const setGoals = makeActionCreator(SET_GOALS, 'goals');
export const setGoalsEventSum = makeActionCreator(SET_GOALS_EVENTSSUM, 'events');
export const setOSMLocation = makeActionCreator(SET_OSM_LOCATION, 'location', 'coords');
export const setOSMRoute = makeActionCreator(SET_OSM_ROUTE, 'from', 'to', 'route');
