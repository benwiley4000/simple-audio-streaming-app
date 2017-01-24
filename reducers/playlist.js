require('string.prototype.endswith');

var actionTypes = require('../actionTypes');

function playlist (state, action) {
  state = state || [];
  switch (action.type) {
    case actionTypes.ADD_TRACKS:
      return state.concat(
        (action.tracks || []).filter(function (track) {
          return (
            track &&
            typeof track.displayText === 'string' &&
            typeof track.url === 'string' &&
            track.url.endsWith('.mp3')
          );
        })
      );
    case actionTypes.REMOVE_TRACKS:
      return state.filter(function (track) {
        return action.urls.indexOf(track.url) === -1;
      });
    case actionTypes.MODIFY_TRACK:
      return state.map(function (track) {
        if (action.url === track.url) {
          return {
            displayText: action.displayText || track.displayText,
            url: track.url
          };
        }
        return track;
      });
    default:
      return state;
  }
}

module.exports = playlist;
