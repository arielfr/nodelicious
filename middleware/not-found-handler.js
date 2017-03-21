const errors = require('errors');

module.exports = function (app) {
  //Handle all 404 as exception - This must go to the error-handler and output as an error
  app.use(function (req, res, next) {
    res.redirect('/');
  });
};