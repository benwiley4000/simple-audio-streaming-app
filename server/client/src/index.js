var React = require('react');
var ReactDOM = require('react-dom');
var AudioPlayer = require('react-responsive-audio-player');
var createStore = require('redux').createStore;
var objectAssign = require('object-assign');

/* client playlist reducer - different than the one used
 * by the server!
 */
var playlistReducer = require('../../../reducers/playlist');

var store = createStore(
  playlistReducer,
  window.INITIAL_STATE,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

var audioElement = {};

function render (state) {
  ReactDOM.render(
    React.createElement(AudioPlayer, {
      playlist: state,
      autoplay: true,
      style: { position: 'fixed', bottom: 0 },
      audioElementRef: function (elem) {
        audioElement = elem;
      }
    }),
    document.getElementById('audio_player_container')
  );
}

var prev = store.getState();
store.subscribe(function () {
  var curr = store.getState();
  if (prev === curr) {
    return;
  }
  render(store.getState());
  prev = curr;
});
render(prev);

function webSocketUrl(s) {
  var l = window.location;
  var protocol = (l.protocol === "https:") ? "wss://" : "ws://";
  return protocol + l.host + l.pathname + s;
}

var ws = new WebSocket(webSocketUrl('ws'));

ws.addEventListener('message', function (e) {
  var action = JSON.parse(e.data);
  store.dispatch(action);
});

ws.addEventListener('open', function () {
  ws.send(JSON.stringify({
    type: 'SET_REMOTE_NAME',
    name: 'Ben'
  }));
  ws.send(JSON.stringify({
    type: 'ADD_TRACKS',
    tracks: [{
      displayText: 'Soup to Nuts',
      url: '/Users/wileyb/Downloads/BoundTogether/Bound Together-01-ktriton-Soup to Nuts.mp3'
    }]
  }));
});

document.addEventListener('keyup', function (e) {
  if (e.keyCode === 32) {
    audioElement[audioElement.paused ? 'play' : 'pause']();
  }
});
