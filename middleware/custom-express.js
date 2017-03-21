const logger = require('../initializers/logger.js');

module.exports = function (app) {
  app.use(function (req, res, next) {
    //Do not log static urls
    const regex = /^\/(css|js|fonts|images)\//;

    if (!regex.test(req.url)) {
      logger.info('[%s] %s', req.method, req.url);
    }

    next();
  });
};