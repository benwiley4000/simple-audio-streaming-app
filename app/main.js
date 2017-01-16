var electron = require('electron');
var createStore = require('redux').createStore;

var startServer = require('../server');
var reducer = require('./reducer');

var store = createStore(reducer);

electron.app.on('ready', function () {
  var mainWindow = new electron.BrowserWindow({ width: 600, height: 600 });
  mainWindow.loadURL('file://' + __dirname + '/renderer/index.html');
});

var server = null;
store.subscribe(function () {
  var state = store.getState();
  if (state.running && !server) {
    server = startServer(state.directories, state.port);
  }
  if (!state.running && server) {
    server.close();
    server = null;
  }
});

electron.ipcMain.on('action', function (event, action) {
  store.dispatch(action);
  event.sender.send('statechange', store.getState());
});
