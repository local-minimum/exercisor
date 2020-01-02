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

export const setName = makeActionCreator(SET_NAME, 'name');
export const setEvents = makeActionCreator(SET_EVENTS, 'events');
