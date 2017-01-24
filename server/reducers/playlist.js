var objectAssign = require('object-assign');

var actionTypes = require('../../actionTypes');
var sharedPlaylist = require('../../reducers/playlist');

function playlist (state, action) {
  state = state || [];
  var newState = sharedPlaylist(state, action);
  switch (action.type) {
    case actionTypes.ADD_TRACKS:
      return newState.map(function (track) {
        return objectAssign({}, track, {
          remoteAddress: action.remoteAddress
        });
      });
    default:
      return newState;
  }
}

module.exports = playlist;
