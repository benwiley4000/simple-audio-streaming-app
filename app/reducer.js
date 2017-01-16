var objectAssign = require('object-assign');

var defaultState = {
  port: 3000,
  directories: [],
  running: false
};

function reducer (state, action) {
  state = state || defaultState;
  switch (action.type) {
    case 'SET_PORT':
      return objectAssign({}, state, {
        port: action.port
      });
    case 'ADD_DIRECTORIES':
      return objectAssign({}, state, {
        directories: state.directories.concat(action.directories)
      });
    case 'REMOVE_DIRECTORY':
      return objectAssign({}, state, {
        directories: (
          state.directories.slice(0, action.index)
            .concat(state.directories.slice(action.index + 1))
        )
      });
    case 'TOGGLE_RUNNING':
      return objectAssign({}, state, {
        running: !state.running
      });
  }
}

reducer.defaultState = defaultState;

module.exports = reducer;
