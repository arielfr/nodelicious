var express = require('express'),
    index = express.Router(),
    _ = require('lodash'),
    moment = require('moment');

index.get('/', function(req, res, next){
    var esClient = global.esClient,
        model = {},
        errors = req.flash('error');

    if( req.user ){
        model.user = req.user;
    }

    if( errors ){
        model.error = errors;
    }

    var userCount = esClient.countSync({
        index: 'messi',
        type: 'users'
    });

    userCount = userCount.count;

    model.count = userCount;

    model.recentUsers = getAlreadySignUsers();

    res.renderSync('index', model);
});

getAlreadySignUsers = function(){
    var esClient = global.esClient;

    var users = esClient.searchSync({
        index: 'messi',
        type: 'users',
        body: {
            "size": 5,
            "sort": [
                {
                    "created_date": {
                        "order": "desc"
                    }
                }
            ],
            "query": {
                "match_all": {}
            }
        }
    }).hits.hits;

    if( _.isEmpty(users) ){
        return [];
    }

    users = _(users).map(function(hit){
        var source = hit._source,
            user = {};

        user.name = (source.social) ? source.displayName : source.firstname + ' ' + source.lastname;
        user.image = (source.social) ? 'http://graph.facebook.com/' + source.social_id + '/picture?type=square' : '/images/avatar.png';
        user.created_date = moment(source.created_date).format('LL');

        return user;
    }).value();

    return users;
};

module.exports = index;