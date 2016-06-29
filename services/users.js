var bodyBuilder = require('bodybuilder'),
    bcrypt = require('bcrypt'),
    _ = require('lodash');

var userService = function(){};

userService.prototype.getUserByEmail = function(email){
    var esClient = global.esClient;

    var user = _(esClient.searchSync({
        index: 'messi',
        type: 'users',
        body: {
            "query": {
                "match_phrase": {
                    "email": email.toLowerCase()
                }
            }
        }
    }).hits.hits).map('_source').first();

    return user;
};

userService.prototype.getUserBySocialId = function(socialId){
    var esClient = global.esClient;

    var user = _(esClient.searchSync({
        index: 'messi',
        type: 'users',
        body: {
            "query": {
                "match_phrase": {
                    "social_id": socialId
                }
            }
        }
    }).hits.hits).map('_source').first();

    return user;
};

userService.prototype.registerLocalUser = function(user){
    var esClient = global.esClient;

    //Lowercase the email
    user.email = user.email.toLowerCase();
    user.password = 'messi';
    user.password = bcrypt.hashSync(user.password, 10);

    esClient.indexSync({
        index: 'messi',
        type: 'users',
        body: user
    });

    return user;
};

userService.prototype.registerSocialUser = function(user){
    var esClient = global.esClient;

    //Lowercase the email
    user.email = (user.email) ? user.email.toLowerCase() : '';
    user.password = 'messi';
    user.password = bcrypt.hashSync(user.password, 10);

    esClient.indexSync({
        index: 'messi',
        type: 'users',
        body: user
    });

    return user;
};

module.exports = new userService();