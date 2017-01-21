require('string.prototype.endswith');
var fs = require('fs');
var path = require('path');
var express = require('express');
var asyncMap = require('async.map');

var resolveHome = require('./resolveHome');

var html = fs.readFileSync(path.join(__dirname, 'index.html')).toString();

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

module.exports = function server (options) {
  options = options || {};
  options.audioDirectories = options.audioDirectories;
  options.port = options.port || 3000;

  var app = express();

  app.use(express.static(path.join(
    process.cwd(),
    'node_modules/react-responsive-audio-player/dist'
  )));

  options.audioDirectories.forEach(function (directory) {
    app.use(express.static(resolveHome(directory)));
  });

  app.get('/', function (req, res) {
    res.header('Content-Type', 'text/html');
    fetchMp3ListsFlattened(options.audioDirectories, function (err, audioList) {
      if (err) {
        console.error(err);
        return res.status(500).end('500 Server Error');
      }
      res.end(html.replace(
        'var playlist = []',
        'var playlist = ' + JSON.stringify(audioList)
      ));
    });
  });

  return app.listen(options.port, function () {
    console.log('Your playlist is available at port ' + options.port);
  });
};
