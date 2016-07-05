var bodyBuilder = require('bodybuilder'),
    bcrypt = require('bcrypt'),
    _ = require('lodash'),
    moment = require('moment'),
    uuid = require('node-uuid');

var linkService = function(){};

linkService.prototype.getLinkByUUID = function(uuid){
    var esClient = global.esClient;

    var link = esClient.searchSync({
        index: 'nodelicious',
        type: 'links',
        body: new bodyBuilder().filter('term', 'uuid', uuid).build()
    }).hits.hits;

    //Add the id to the user element
    link = _(_(link).map(function(hit){
        var source = hit._source;
        if(_.isEmpty(source.tags)){
            delete source.tags;
        }
        return source;
    })).first();

    return link;
};

linkService.prototype.createLink = function(link){
    var esClient = global.esClient;

    link.uuid = uuid.v1();
    link.created_date = moment().toDate();

    esClient.indexSync({
        index: 'nodelicious',
        type: 'links',
        body: link
    });

    return link;
};

module.exports = new linkService();