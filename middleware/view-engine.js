const handlebars = require('express-handlebars');
const layouts = require('express-handlebars-layouts');
const swag = require('swag');
const moment = require('moment');
const i18n = require('i18n');
const config = require('config');

module.exports = function (app, baseDirectory) {
  const hbs = handlebars.create({
    partialsDir: [
      'templates/partials/'
    ]
  });

  //Register layouts helpers on handlebars
  hbs.handlebars.registerHelper(layouts(hbs.handlebars));
  //Register swag extend helper
  hbs.handlebars.registerHelper(swag.helpers);
  //Override i18n - Adding helper for i18n
  hbs.handlebars.registerHelper('i18n', function (phrase) {
    return i18n.__(phrase);
  });
  hbs.handlebars.registerHelper('snippet', function (snippet) {
    return eval(snippet);
  });
  hbs.handlebars.registerHelper('stringify', function (json) {
    return JSON.stringify(json);
  });
  //Moment format for links
  hbs.handlebars.registerHelper('linkDateFormat', function (date) {
    return moment(date).fromNow();
  });

  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');
  app.set('views', baseDirectory + '/templates');

  if (config.get('handlebars.cache')) {
    app.enable('view cache');
  }
};