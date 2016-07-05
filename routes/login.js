var express = require('express'),
    login = express.Router(),
    passport = require('passport'),
    authFilter = require('../middleware/authentication-filter'),
    _ = require('lodash');

login.get('/login', authFilter.notLoggedIn, function(req, res, next){
    res.renderSync('login', { navbar: { login: true }, error: req.flash('error'), body: _(req.flash('body')).first() });
});

/**
 * Logout user
 */
login.get('/logout', function(req, res, next){
    req.logout();
    res.redirect('/');
});

login.get('/login/facebook', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/', scope: 'email' }));

/**
 * Local login endpoint
 */
login.post('/login/local', function(req, res, next){
    if( _.isEmpty(req.body.email) ){
        req.flash('error', 'The email is mandatory');
        return res.redirect('/login');
    }

    passport.authenticate('local', function(err, user, info){
        if(err){
            global.log.error(err);
            req.flash('error', err.message);

            //Remove the password from the body
            delete req.body.password;
            req.flash('body', req.body);

            return res.redirect('/login');
        }

        req.logIn(user, function(err){
            if(err){
                global.log.error(err);
                req.flash('error', err.message);

                //Remove the password from the body
                delete req.body.password;
                req.flash('body', req.body);

                return res.redirect('/login');
            }
            return res.redirect('/');
        });
    })(req,res,next);
});

module.exports = login;