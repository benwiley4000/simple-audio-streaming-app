var React = require('react');
var ReactDOM = require('react-dom');
var ipc = require('electron').ipcRenderer;

var DirectoryList = require('./DirectoryList');
var defaultState = require('../reducer').defaultState;

function handleAddDirectories (directories) {
  ipc.send('action', {
    type: 'ADD_DIRECTORIES',
    directories: directories
  });
}

function handleRemoveDirectory (index) {
  ipc.send('action', {
    type: 'REMOVE_DIRECTORY',
    index: index
  });
}

function render (state) {
  ReactDOM.render(
    React.createElement(DirectoryList, {
      directories: state.directories,
      onRemoveDirectory: handleRemoveDirectory
    }),
    document.getElementById('directory_list')
  );
}

render(defaultState);

ipc.on('statechange', function (event, state) {
  render(state);
});
