require('dotenv-safe').load();

var server = require('./server');

var audioDirectories =
    process.env.AUDIO_DIRECTORY
        .split(',')
        .map(function (dir) {
            return dir.trim();
        });

server(audioDirectories);
