var bodyBuilder = require('bodybuilder'),
    bcrypt = require('bcrypt'),
    _ = require('lodash'),
    moment = require('moment');

var userService = function(){};

userService.prototype.getUserByEmail = function(email){
    var esClient = global.esClient;

    var user = _(esClient.searchSync({
        index: 'nodelicious',
        type: 'users',
        body: new bodyBuilder().filter('term', 'email', email.toLowerCase()).build()
    }).hits.hits).map('_source').first();

    return user;
};

userService.prototype.registerUser = function(user){
    var esClient = global.esClient;

    //Lowercase the email
    user.email = user.email.toLowerCase();
    user.password = bcrypt.hashSync(user.password, 10);
    user.created_date = moment().toDate();

    esClient.indexSync({
        index: 'nodelicious',
        type: 'users',
        body: user
    });

    return user;
};

module.exports = new userService();