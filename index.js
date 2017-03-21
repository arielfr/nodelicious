const express = require('express');
const path = require('path');
const superExpress = require('superexpress');
const config = require('config');
const moment = require('moment');
const logger = require('./initializers/logger.js');
const app = express();
const port = process.env.APP_PORT || 3000;

const baseDirectory = __dirname;

//Setting up momentjs library locale
//moment.locale('es');

//Middlewares
require('./middleware/custom-express.js')(app);
require('./middleware/view-engine')(app, baseDirectory);
require('./middleware/statics.js')(app);
require('./middleware/bodyparser.js')(app);
require('./middleware/cookieparser.js')(app);
require('./middleware/flash-messages.js')(app);
require('./middleware/security.js')(app);
require('./middleware/localization.js')(app);
require('./middleware/custom-renderer.js')(app);

//Add routes
superExpress.scanRoutes(app, path.join(baseDirectory, 'routes'));

//404 Not Found Handler
require('./middleware/not-found-handler.js')(app);
//Middleware - This must be the last middleware for error handling
require('./middleware/error-handler.js')(app);

//Starting application
app.listen(port, function () {
  logger.info('[%s] Nodelicious listening to port %s', config.get('environment'), port);
});