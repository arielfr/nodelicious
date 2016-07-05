var express = require('express'),
    path = require('path'),
    superExpress = require('superexpress'),
    config = require('config'),
    moment = require('moment'),
    app = express(),
    port = process.env.APP_PORT || 3000;

//Crating global variables
global.config = config;
global.__basedir = __dirname;

//Setting up momentjs library locale
//moment.locale('es');

//Initializers
require('./initializers/logger.js')(app);
require('./initializers/elasticsearch.js')(app);
require('./initializers/showdown.js')(app);

//Middlewares
require('./middleware/custom-express.js')(app);
require('./middleware/view-engine')(app);
require('./middleware/statics.js')(app);
require('./middleware/bodyparser.js')(app);
require('./middleware/cookieparser.js')(app);
require('./middleware/flash-messages.js')(app);
require('./middleware/security.js')(app);
//This middleware will be the FIRST from the ones who needs to use SYNC
require('./middleware/synchronize')(app);
require('./middleware/localization.js')(app);
require('./middleware/custom-renderer.js')(app);

//Add routes
superExpress.scanRoutes(app, path.join(global.__basedir, 'routes'));

//404 Not Found Handler
require('./middleware/not-found-handler.js')(app);
//Middleware - This must be the last middleware for error handling
require('./middleware/error-handler.js')(app);

//Starting application
app.listen(port, function(){
    global.log.info('[%s] Nodelicious listening to port %s', global.config.get('environment'), port);
});