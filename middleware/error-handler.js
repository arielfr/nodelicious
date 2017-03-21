const errors = require('errors');
const logger = require('../initializers/logger.js');

module.exports = function (app) {
  app.use((err, req, res, next) => {
    let error;

    logger.debug(err);

    if (err instanceof Error && err.name == 'Error') {
      error = new errors.Http500Error(err.toString());
    } else {
      error = err;
    }

    if (error.code == 404) {
      res.render('404');
    } else {
      res.render('500');
    }
  });
};
