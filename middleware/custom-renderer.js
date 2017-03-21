const sync = require('synchronize');
const defer = sync.defer;
const await = sync.await;
const config = require('config');

module.exports = function (app) {
  const defaultModel = {
    title: config.get('page.title'),
    navbar: {
      title: config.get('page.navbar.title')
    }
  };

  //This will append defualt configuration to all models
  function loadDefaultModel(model) {
    model = Object.assign({}, defaultModel, model);

    return model;
  }

  app.use(function (req, res, next) {
    res.renderSync = function (view, model) {
      model.isLogged = (req.user) ? true : false;
      model.user = req.user;

      model = loadDefaultModel(model);

      const pageRender = await(res.render(view, model, defer()));

      res.send(pageRender);
    };

    next();
  });
};