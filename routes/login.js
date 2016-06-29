var express = require('express'),
    login = express.Router(),
    passport = require('passport'),
    authFilter = require('../middleware/authentication-filter'),
    _ = require('lodash');

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
    req.body.password = 'messi';

    if( _.isEmpty(req.body.username) || _.isEmpty(req.body.firstname) || _.isEmpty(req.body.lastname) ){
        req.flash('error', 'Los campos nombre, apellido y email son obligatorios');
        return res.redirect('/');
    }

    passport.authenticate('local', function(err, user, info){
        if(err){
            req.flash('error', err.message);
            return res.redirect('/');
        }

        req.logIn(user, function(err){
            if(err){
                req.flash('error', err.message);
                return res.redirect('/');
            }
            return res.redirect('/');
        });
    })(req,res,next);
});

module.exports = login;