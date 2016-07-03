var passport = require('passport'),
    session = require('express-session'),
    localStrategy = require('passport-local').Strategy,
    redisStore = require('connect-redis')(session),
    sync = require('synchronize'),
    bcrypt = require('bcrypt'),
    _ = require('lodash'),
    userService = require('../services/users'),
    moment = require('moment');

module.exports = function(app){
    var redisSessionStore = new redisStore({
        host: global.config.get('redis.host'),
        port: global.config.get('redis.port'),
        db: 1,
        ttl: 60 * 60 //1 Hour
    });

    app.use(session({
        store: redisSessionStore,
        secret: 'patas',
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
    passport.use(new localStrategy(
        {usernameField: 'email', passReqToCallback: true},
        function(req, email, password, done){
            sync.fiber(function(){
                try{
                    var user = userService.getUserByEmail(email);

                    if( _.isEmpty(user) ){
                        throw new Error('The user with email ' + email + ' doesnt exists');
                    }

                    if( !bcrypt.compareSync(password, user.password) ){
                        throw new Error('The password is not valid');
                    }

                    global.log.debug('El usuario %s ha ingresado exitosamente', user.email);

                    return done(null, user);
                }catch(e){
                    return done(e, false);
                }
            });
        }
    ));
};