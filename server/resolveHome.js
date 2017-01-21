var path = require('path');

// http://stackoverflow.com/a/36221905
function resolveHome (filepath) {
  if (filepath[0] === '~' && process.env.HOME) {
    return path.join(process.env.HOME, filepath.slice(1));
  }
  return filepath;
}

module.exports = resolveHome;
