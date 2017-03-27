const passport = require('passport');
const session = require('express-session');
const localStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcrypt');
const _ = require('lodash');
const userService = require('../services/users');
const moment = require('moment');
const logger = require('../initializers/logger.js');
const config = require('config');

module.exports = function (app) {
  const sessionStore = new MongoStore({
    url: 'mongodb://' + config.get('mongo.host') + ':' + config.get('mongo.port') + '/' + config.get('mongo.database'),
    ttl: 60 * 60 // 1 Hour
  });

  app.use(session({
    store: sessionStore,
    secret: 'nodelicious',
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  //Local strategy
  passport.use(new localStrategy({
      usernameField: 'email',
      passReqToCallback: true
    },
    function (req, email, password, done) {
      userService.getUserByEmail(email).then(user => {
        if (_.isEmpty(user)) {
          return done(new Error('The user with email ' + email + ' doesnt exists'), false);
        }

        if (!bcrypt.compareSync(password, user.password)) {
          return done(new Error('The password is not valid'), false);
        }

        logger.debug('El usuario %s ha ingresado exitosamente', user.email);

        return done(null, user);
      });
    }
  ));
};