var combineReducers = require('redux').combineReducers;

module.exports = combineReducers({
  playlist: require('./playlist'),
  remotes: require('./remotes')
});
