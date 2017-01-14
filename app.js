require('dotenv-safe').load();

require('string.prototype.endswith');
var fs = require('fs');
var path = require('path');
var express = require('express');
var asyncMap = require('async.map');

var audioDirectories =
    process.env.AUDIO_DIRECTORY
        .split(',')
        .map(function (dir) {
            return dir.trim();
        });

var html = fs.readFileSync('index.html').toString();

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

function fetchMp3ListsFlattened (callback) {
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

var app = express();

app.use(express.static('node_modules/react-responsive-audio-player/dist'));
audioDirectories.forEach(function (directory) {
    app.use(express.static(resolveHome(directory)));
});

app.get('/', function (req, res) {
    res.header('Content-Type', 'text/html');
    fetchMp3ListsFlattened(function (err, audioList) {
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

app.listen(3000, function () {
    console.log('Your playlist is available at port 3000');
});
