var fs = require('fs');
var asyncMap = require('async.map');

var resolveHome = require('./resolveHome');

function fetchMp3List (directory, callback) {
  fs.readdir(resolveHome(directory), function (err, files) {
    if (err) {
      return callback(err);
    }
    var mp3s = files.filter(function (file) {
      return file.endsWith('.mp3');
    }).map(function (file) {
      return {
        url: file,
        displayText: file.slice(0, -4)
      };
    });
    callback(null, mp3s);
  });
}

function fetchMp3ListsFlattened (audioDirectories, callback) {
  asyncMap(audioDirectories, fetchMp3List, function (err, mp3Lists) {
    if (err) {
      return callback(err);
    }
    if (mp3Lists.length === 1) {
      return callback(null, mp3Lists[0]);
    }
    callback(
      null,
      Array.prototype.concat.apply(mp3Lists[0], mp3Lists.slice(1))
    );
  });
}

module.exports = fetchMp3ListsFlattened;
