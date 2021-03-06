const express = require('express');
const login = express.Router();
const passport = require('passport');
const authFilter = require('../middleware/authentication-filter');
const _ = require('lodash');
const logger = require('../initializers/logger.js');

login.get('/login', authFilter.notLoggedIn, function (req, res, next) {
  res.customRender('login', {
    navbar: {
      login: true
    },
    error: req.flash('error'),
    body: _(req.flash('body')).first()
  });
});

/**
 * Logout user
 */
login.get('/logout', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

login.get('/login/facebook', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/',
  scope: 'email'
}));

/**
 * Local login endpoint
 */
login.post('/login/local', function (req, res, next) {
  if (_.isEmpty(req.body.email)) {
    req.flash('error', 'The email is mandatory');
    return res.redirect('/login');
  }

  passport.authenticate('local', function (err, user, info) {
    if (err) {
      logger.error(err);
      req.flash('error', err.message);

      //Remove the password from the body
      delete req.body.password;
      req.flash('body', req.body);

      return res.redirect('/login');
    }

    req.logIn(user, function (err) {
      if (err) {
        logger.error(err);
        req.flash('error', err.message);

        //Remove the password from the body
        delete req.body.password;
        req.flash('body', req.body);

        return res.redirect('/login');
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

module.exports = login;