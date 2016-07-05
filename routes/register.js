var express = require('express'),
    register = express.Router(),
    passport = require('passport'),
    authFilter = require('../middleware/authentication-filter'),
    _ = require('lodash'),
    userService = require('../services/users');

register.get('/register', authFilter.notLoggedIn, function(req, res, next){
    res.renderSync('register', { navbar: { register: true }, error: req.flash('error'), body: _(req.flash('body')).first() });
});

register.post('/register/local', function(req, res, next){
    if( _.isEmpty(req.body.firstname) || _.isEmpty(req.body.lastname) || _.isEmpty(req.body.email) || _.isEmpty(req.body.password) ){
        req.flash('error', 'Must complete all the fields (*)');
        req.flash('body', req.body);
        return res.redirect('/register');
    }

    var user = userService.registerUser({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password
    });

    req.logIn(user, null, function () {
        global.log.debug('El usuario %s se ha registrado exitosamente', user.email);

        res.redirect('/');
    });
});

module.exports = register;