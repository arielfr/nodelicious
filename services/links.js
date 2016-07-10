var bodyBuilder = require('bodybuilder'),
    bcrypt = require('bcrypt'),
    _ = require('lodash'),
    moment = require('moment'),
    uuid = require('node-uuid');

var linkService = function(){};

linkService.prototype.getTagsCount = function(){
    var esClient = global.esClient;

    var tags = esClient.searchSync({
        index: 'nodelicious',
        type: 'links',
        body: {
            "size": 0,
            "aggs": {
                "tags": {
                    "terms": {
                        "field": "tags",
                        "size": 1000
                    }
                }
            }
        }
    });

    var buckets = tags.aggregations.tags.buckets;

    var tagCloud = [];

    if(!_.isEmpty(buckets)){
        _.forEach(buckets, function(bucket){
            tagCloud.push({
                key: bucket.key,
                count: bucket.doc_count
            });
        });
    }

    return tagCloud;
};

linkService.prototype.getLinks = function(user, size, from){
    var esClient = global.esClient,
        from = (from) ? from : 0,
        size = (size) ? size : 25,
        getPrivate = (user) ? true : false;

    var query = {};

    query = {
        "from": from,
        "size": size,
        "sort": [
            {
                "created_date": {
                    "order": "desc"
                }
            }
        ],
        "query": {
            "bool": {
                "should": [
                    {
                        "term": {
                            "public": {
                                "value": true
                            }
                        }
                    }
                ]
            }
        }
    };

    if(getPrivate){
        query.query.bool.should.push({
            term: {
                public: false
            }
        });
    }

    var links = esClient.searchSync({
        index: 'nodelicious',
        type: 'links',
        body: query
    }).hits.hits;

    //Add the id to the user element
    links = _(_(links).map(function(hit){
        var source = hit._source;
        if(_.isEmpty(source.tags)){
            delete source.tags;
        }
        //Convert to HTML with markdown
        source.description = global.showdown.makeHtml(source.description);
        return source;
    })).value();

    return links;
};

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
        //Convert to HTML with markdown
        source.description = global.showdown.makeHtml(source.description);
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