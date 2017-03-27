const config = require('config');
const _ = require('lodash');

module.exports = function (app) {
  const defaultModel = {
    title: config.get('page.title'),
    navbar: {
      title: config.get('page.navbar.title')
    }
  };

  app.use(function (req, res, next) {
    res.customRender = function (view, model) {
      return new Promise((resolve, reject) => {
        model.isLogged = (req.user) ? true : false;
        model.user = req.user;

        model = _.merge({}, defaultModel, model);

        res.render(view, model, (err, response) => {
          if(err) reject(err);

          resolve(response);

          res.send(response);
        });
      });
    };

    next();
  });
};