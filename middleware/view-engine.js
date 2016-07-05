var handlebars  = require('express-handlebars'),
    layouts = require('express-handlebars-layouts'),
    swag = require('swag'),
    moment = require('moment');

module.exports = function(app){
    var hbs = handlebars.create({
        partialsDir: [
            'templates/partials/'
        ]
    });

    //Register layouts helpers on handlebars
    hbs.handlebars.registerHelper(layouts(hbs.handlebars));
    //Register swag extend helper
    hbs.handlebars.registerHelper(swag.helpers);
    //Override i18n - Adding helper for i18n
    hbs.handlebars.registerHelper('i18n', function(phrase){
        return global.i18n.__(phrase);
    });
    //Moment format
    hbs.handlebars.registerHelper('linkDateFormat', function(date){
        return moment(date).fromNow();
    });

    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');
    app.set('views', global.__basedir + '/templates');

    if( global.config.get('handlebars.cache') ){
        app.enable('view cache');
    }
};