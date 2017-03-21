const passport = require('passport');
const session = require('express-session');
const localStrategy = require('passport-local').Strategy;
const redisStore = require('connect-redis')(session);
const sync = require('synchronize');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const userService = require('../services/users');
const moment = require('moment');
const logger = require('../initializers/logger.js');
const config = require('config');

module.exports = function (app) {
  const redisSessionStore = new redisStore({
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    db: 1,
    ttl: 60 * 60 //1 Hour
  });

  app.use(session({
    store: redisSessionStore,
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
      sync.fiber(function () {
        try {
          const user = userService.getUserByEmail(email);

          if (_.isEmpty(user)) {
            throw new Error('The user with email ' + email + ' doesnt exists');
          }

          if (!bcrypt.compareSync(password, user.password)) {
            throw new Error('The password is not valid');
          }

          logger.debug('El usuario %s ha ingresado exitosamente', user.email);

          return done(null, user);
        } catch (e) {
          return done(e, false);
        }
      });
    }
  ));
};