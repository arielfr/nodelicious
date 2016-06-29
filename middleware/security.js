var passport = require('passport'),
    session = require('express-session'),
    localStrategy = require('passport-local').Strategy,
    facebookStrategy = require('passport-facebook').Strategy,
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
        {usernameField: 'username', passReqToCallback: true},
        function(req, username, password, done){
            sync.fiber(function(){
                try{
                    var user = userService.getUserByEmail(username);

                    if( _.isEmpty(user) ){
                        user = userService.registerLocalUser({
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            email: username,
                            password: password,
                            created_date: moment().toDate()
                        });
                    }else{
                        user.already = true;
                    }

                    return done(null, user);
                }catch(e){
                    return done(e, false);
                }
            });
        }
    ));

    passport.use(new facebookStrategy({
        clientID: '1791767634442831',
        clientSecret: '387ce258bbf1da2d94e4698188fe5484',
        callbackURL: "http://www.quedatemessi.com.ar/login/facebook",
        profileFields: ['id', 'displayName', 'emails']
    }, function(accessToken, refreshToken, profile, done){
        sync.fiber(function(){
            try{
                if(!profile){
                    return done(new Error('Ha ocurrido un error'), false);
                }

                var user = userService.getUserBySocialId(profile.id);

                if(!user){
                    user = userService.registerSocialUser({
                        social_id: profile.id,
                        email: profile.emails[0].value,
                        social: true,
                        displayName: profile.displayName,
                        provider: profile.provider,
                        created_date: moment().toDate()
                    });
                }else{
                    user.already = true;
                }

                return done(null, user);
            }catch(e){
                return done(e, false);
            }
        });
    }));
};