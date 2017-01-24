var objectAssign = require('object-assign');

var actionTypes = require('../../actionTypes');

function remotes (state, action) {
  state = state || {};
  switch (action.type) {
    case actionTypes.SET_REMOTE_PORT: {
      if (
        typeof action.remoteAddress === 'string' &&
        typeof action.remotePort === 'number'
      ) {
        var newState = objectAssign({}, state);
        newState[action.remoteAddress] = objectAssign(
          {},
          state[action.remoteAddress] || {}
        );
        newState[action.remoteAddress].port = action.remotePort;
        return newState;
      }
      return state;
    }
    case actionTypes.SET_REMOTE_NAME: {
      if (
        typeof action.remoteAddress === 'string' &&
        typeof action.name === 'string'
      ) {
        var newState = objectAssign({}, state);
        newState[action.remoteAddress] = objectAssign(
          {},
          state[action.remoteAddress] || {}
        );
        newState[action.remoteAddress].name = action.name;
        return newState;
      }
      return state;
    }
    case actionTypes.SOCKET_OPENED: {
      var newState = objectAssign({}, state);
      newState[action.remoteAddress] = {
        port: 3000,
        name: ''
      };
      return newState;
    }
    case actionTypes.SOCKET_CLOSED: {
      var newState = objectAssign({}, state);
      delete newState[action.remoteAddress];
      return newState;
    }
    default:
      return state;
  }
}

module.exports = remotes;
