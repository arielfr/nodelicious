const sync = require('synchronize');

module.exports = function (app) {
  app.use(function (req, res, next) {
    sync.fiber(next);
  });
};
