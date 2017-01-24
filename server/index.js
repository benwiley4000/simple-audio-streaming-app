var fs = require('fs');
var path = require('path');
var express = require('express');
var WebSocket = require('ws');
var createStore = require('redux').createStore;
var objectAssign = require('object-assign');
var qs = require('qs');
require('string.prototype.endswith');

var reducer = require('./reducers');
var actionTypes = require('../actionTypes');

var html = fs.readFileSync(path.join(__dirname, 'client/index.html')).toString();

module.exports = function (port) {
  port = port || 3000;

  function getClientAudioUrl (remoteAddress, remotePort, filePath) {
    return (
      'http://' + remoteAddress + ':' + remotePort + '/audio?' + qs.stringify({
        file: filePath
      })
    );
  }

  function mapTrackUrlForClient (url, remoteAddress, clientHostHeader, state) {
    var remote = state.remotes[remoteAddress];
    var realRemoteAddress;
    var remotePort;
    if (remoteAddress === '127.0.0.1' || remoteAddress === '::1') {
      var host = clientHostHeader;
      realRemoteAddress =
        host.indexOf(':') === -1 ?
        host :
        host.slice(0, host.indexOf(':'));
      remotePort = port;
    } else {
      realRemoteAddress = remoteAddress;
      remotePort = remote.port;
    }
    return url && getClientAudioUrl(realRemoteAddress, remotePort, url) || url;
  }

  function mapTrackDataForClient (
    trackData, remoteAddress, clientHostHeader, state
  ) {
    var remote = state.remotes[remoteAddress];
    return objectAssign({}, trackData, {
      displayText: (
        trackData.displayText &&
        remote.name &&
        (trackData.displayText + ' (added by ' + remote.name + ')') ||
        trackData.displayText
      ),
      url: mapTrackUrlForClient(
        trackData.url, remoteAddress, clientHostHeader, state
      )
    });
  }

  function mapStateForClient (state, remoteAddress, clientHostHeader) {
    return state.playlist.map(function (track) {
      return mapTrackDataForClient(
        track, remoteAddress, clientHostHeader, state
      );
    });
  }

  function mapActionForClient (action, remoteAddress, clientHostHeader, state) {
    switch (action.type) {
      case actionTypes.ADD_TRACKS:
        return objectAssign({}, action, {
          tracks: action.tracks.map(function (track) {
            return mapTrackDataForClient(
              track, remoteAddress, clientHostHeader, state
            );
          })
        });
      case actionTypes.REMOVE_TRACKS:
        return objectAssign({}, action, {
          urls: action.urls.map(function (url) {
            return mapTrackUrlForClient(
              url, remoteAddress, clientHostHeader, state
            );
          })
        });
      case actionTypes.MODIFY_TRACK:
        return mapTrackDataForClient(
          action, remoteAddress, clientHostHeader, state
        );
      default:
        return action;
    }
  }

  function mapActionForServer (action, remoteAddress) {
    return objectAssign({}, action, {
      remoteAddress: remoteAddress
    });
  }

  function broadcast (wss, data, remoteAddress, state, mapDataForClient) {
    wss.clients.forEach(function each (client) {
      client.send(JSON.stringify(
        mapDataForClient ?
        mapDataForClient(
          data, remoteAddress, client.upgradeReq.headers.host, state
        ) :
        data
      ));
    });
  }

  var store = createStore(reducer);

  var app = express();
  var http = require('http').Server(app);
  var wss = new WebSocket.Server({ server: http });

  app.use(express.static(path.join(__dirname, 'client')));

  app.use(express.static(path.join(
    __dirname,
    '../node_modules/react-responsive-audio-player/dist'
  )));

  app.get('/', function (req, res) {
    res.header('Content-Type', 'text/html');
    res.end(html.replace(
      '__INITIAL_STATE__',
      JSON.stringify(mapStateForClient(
        store.getState(),
        req.connection.remoteAddress,
        req.headers.host
      ))
    ));
  });

  app.get('/audio', function (req, res) {
    var file = req.query.file;
    if (!file || typeof file !== 'string') {
      res.status(400).end('Must specify file.');
    } else if (file.endsWith('.mp3')) {
      res.sendFile(file);
    } else {
      res.status(403).end('Not allowed!');
    }
  });

  wss.on('connection', function (ws) {
    var remoteAddress = ws.upgradeReq.connection.remoteAddress;

    store.dispatch({
      type: actionTypes.SOCKET_OPENED,
      remoteAddress: remoteAddress
    });

    ws.on('message', function (msg) {
      var action = JSON.parse(msg);

      broadcast(
        wss,
        action,
        remoteAddress,
        store.getState(),
        mapActionForClient
      );

      store.dispatch(mapActionForServer(action, remoteAddress));
    });

    ws.on('close', function () {
      var removeTracksAction = {
        type: actionTypes.REMOVE_TRACKS,
        urls: store.getState().playlist.filter(function (track) {
          return remoteAddress === track.remoteAddress;
        })
      };

      broadcast(
        wss,
        removeTracksAction,
        remoteAddress,
        store.getState(),
        mapActionForClient
      );

      store.dispatch(mapActionForServer(removeTracksAction, remoteAddress));
      store.dispatch({
        type: actionTypes.SOCKET_CLOSED,
        remoteAddress: remoteAddress
      });
    });
  });

  return http.listen(port, function () {
    console.log('Your playlist is available at port ' + port);
  });
};
