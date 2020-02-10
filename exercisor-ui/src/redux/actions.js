function makeActionCreator(type, ...argNames) {
  return function(...args) {
    const action = { type };
    argNames.forEach((_, index) => {
      action[argNames[index]] = args[index]
    });
    return action;
  }
}

export const SET_EDIT_MODE = 'SET_EDIT_MODE';
export const SET_EVENT_TYPE_FILTER = 'SET_EVENT_TYPE_FILTER';
export const SET_NAME = 'SET_NAME';
export const SET_EVENTS = 'SET_EVENTS';
export const SET_YEARS = 'SET_YEARS';
export const SET_YEAR = 'SET_YEAR';
export const CLEAR_ENTRY = 'CLEAR_ENTRY';
export const SET_ENTRY_DATE = 'SET_ENTRY_DATE';
export const SET_ENTRY_DISTANCE = 'SET_ENTRY_DISTANCE';
export const SET_ENTRY_DURATION = 'SET_ENTRY_DURATION';
export const SET_ENTRY_CALORIES = 'SET_ENTRY_CALORIES';
export const SET_ENTRY_TYPE = 'SET_ENTRY_TYPE';
export const SET_ENTRY = 'SET_ENTRY';
export const SET_LOGGED_IN = 'SET_LOGGED_IN';
export const SETTING_LISTALL = 'SETTING_LISTALL';
export const SET_GOALS = 'SET_GOALS';
export const SET_GOALS_EVENTSSUM = 'SET_GOALS_EVENTSSUM';
export const SET_GOALS_WEEKLYDIST = 'SET_GOALS_WEEKLYDIST';
export const SET_OSM_LOCATION = 'SET_OSM_LOCATION';
export const SET_OSM_ROUTE = 'SET_OSM_ROUTE';
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE';
export const SET_REG_USER = 'SET_REG_USER';
export const SET_REG_PWD = 'SET_REG_PWD';
export const SET_REG_PWD2 = 'SET_REG_PWD2';
export const SET_ROUTE_DESIGNS_USER = 'SET_ROUTE_DESIGNS_USER';
export const SET_ROUTE_DESIGNS_PUBLIC = 'SET_ROUTE_DESIGNS_PUBLIC';
export const SET_ROUTE_DESIGN_CONSIDERED = 'SET_ROUTE_DESIGN_CONSIDERED';

export const setEditMode = makeActionCreator(SET_EDIT_MODE, 'value');
export const settingListAll = makeActionCreator(SETTING_LISTALL, 'value');
export const setName = makeActionCreator(SET_NAME, 'name');
export const setLoggedIn = makeActionCreator(SET_LOGGED_IN, 'name', 'redirect');
export const setEvents = makeActionCreator(SET_EVENTS, 'events');
export const setEventTypeFilter = makeActionCreator(SET_EVENT_TYPE_FILTER, 'eventType', 'status');
export const setYears = makeActionCreator(SET_YEARS, 'years');
export const setYear = makeActionCreator(SET_YEAR, 'year');
export const setEntryDate = makeActionCreator(SET_ENTRY_DATE , 'date');
export const setEntryDuration = makeActionCreator(SET_ENTRY_DURATION, 'duration');
export const setEntryDistance = makeActionCreator(SET_ENTRY_DISTANCE, 'distance');
export const setEntryCalories = makeActionCreator(SET_ENTRY_CALORIES, 'calories');
export const setEntryType = makeActionCreator(SET_ENTRY_TYPE, 'eventType');
export const setEntry = makeActionCreator(SET_ENTRY, 'entry');
export const clearEntry = makeActionCreator(CLEAR_ENTRY);
export const setGoals = makeActionCreator(SET_GOALS, 'goals');
export const setGoalsEventSum = makeActionCreator(SET_GOALS_EVENTSSUM, 'events');
export const setGoalsWeeklyDist = makeActionCreator(SET_GOALS_WEEKLYDIST, 'distance');
export const setOSMLocation = makeActionCreator(SET_OSM_LOCATION, 'location', 'coords');
export const setOSMRoute = makeActionCreator(SET_OSM_ROUTE, 'from', 'to', 'route');
export const setErrorMessage = makeActionCreator(SET_ERROR_MESSAGE, 'message', 'target');
export const setRegUser = makeActionCreator(SET_REG_USER, 'user');
export const setRegPwd = makeActionCreator(SET_REG_PWD, 'pwd');
export const setRegPwd2 = makeActionCreator(SET_REG_PWD2, 'pwd2');
export const setUserRouteDesigns = makeActionCreator(SET_ROUTE_DESIGNS_USER, 'designs');
export const setPublicRouteDesigns = makeActionCreator(SET_ROUTE_DESIGNS_PUBLIC, 'designs');
export const setRouteDesignConsidered = makeActionCreator(SET_ROUTE_DESIGN_CONSIDERED, 'routeId');
