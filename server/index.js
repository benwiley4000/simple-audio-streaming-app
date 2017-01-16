require('string.prototype.endswith');
var fs = require('fs');
var path = require('path');
var express = require('express');
var asyncMap = require('async.map');

var html = fs.readFileSync(path.join(__dirname, 'index.html')).toString();

// http://stackoverflow.com/a/36221905
function resolveHome (filepath) {
    if (filepath[0] === '~' && process.env.HOME) {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
}

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

module.exports = function server (audioDirectories, port) {
    var app = express();

    app.use(express.static(path.join(
        process.cwd(),
        'node_modules/react-responsive-audio-player/dist'
    )));

    audioDirectories.forEach(function (directory) {
        app.use(express.static(resolveHome(directory)));
    });

    app.get('/', function (req, res) {
        res.header('Content-Type', 'text/html');
        fetchMp3ListsFlattened(audioDirectories, function (err, audioList) {
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

    return app.listen(port || 3000, function () {
        console.log('Your playlist is available at port 3000');
    });
};
