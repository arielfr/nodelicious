const i18n = require('i18n');

module.exports = function (app) {
  i18n.configure({
    locales: ['es', 'en'],
    defaultLocale: 'es',
    queryParameter: 'language',
    directory: './locales',
    autoReload: true,
    updateFiles: false,
    extension: '.json',
    api: {
      '__': 'i18n'
    }
  });

  //Removing accept-language - Express will automatically replace config if its present
  app.use(function (req, res, next) {
    delete req.headers['accept-language'];
    next();
  });

  app.use(i18n.init);
};