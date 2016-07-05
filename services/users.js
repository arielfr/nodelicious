var bodyBuilder = require('bodybuilder'),
    bcrypt = require('bcrypt'),
    _ = require('lodash'),
    moment = require('moment'),
    uuid = require('node-uuid');

var userService = function(){};

userService.prototype.getUserByEmail = function(email){
    var esClient = global.esClient;

    var user = esClient.searchSync({
        index: 'nodelicious',
        type: 'users',
        body: new bodyBuilder().filter('term', 'email', email.toLowerCase()).build()
    }).hits.hits;

    //Add the id to the user element
    user = _(_(user).map(function(element){
        var source = element._source;
        //Adding id to the user model
        source.id = element._id;
        return source;
    })).first();

    return user;
};

userService.prototype.registerUser = function(user){
    var esClient = global.esClient;

    //Lowercase the email
    user.uuid = uuid.v1();
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