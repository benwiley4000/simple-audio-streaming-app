require('string.prototype.endswith');
var fs = require('fs');
var path = require('path');
var express = require('express');

var resolveHome = require('./resolveHome');
var getSharedDirectoriesMp3List = require('./getSharedDirectoriesMp3List');

var html = fs.readFileSync(path.join(__dirname, 'index.html')).toString();

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
    getSharedDirectoriesMp3List(
      options.audioDirectories,
      function (err, audioList) {
        if (err) {
          console.error(err);
          return res.status(500).end('500 Server Error');
        }
        res.end(html.replace(
          'var playlist = []',
          'var playlist = ' + JSON.stringify(audioList)
        ));
      }
    );
  });

  return app.listen(options.port, function () {
    console.log('Your playlist is available at port ' + options.port);
  });
};
