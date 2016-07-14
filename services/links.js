var bodyBuilder = require('bodybuilder'),
    bcrypt = require('bcrypt'),
    _ = require('lodash'),
    moment = require('moment'),
    uuid = require('node-uuid');

var linkService = function(){};

linkService.prototype.getLinks = function(user, from, size){
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
                ],
                "must": []
            }
        }
    };

    if(getPrivate){
        query.query.bool.should.push({
            "bool": {
                "must": [
                    {
                        "term": {
                            "public": {
                                "value": false
                            }
                        }
                    },
                    {
                        "term": {
                            "creator_id": {
                                "value": user.id
                            }
                        }
                    }
                ]
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
        source.isOwner = (user) ? ((user.id == source.creator_id) ? true : false) : false;
        return source;
    })).value();

    return links;
};

linkService.prototype.getLinkByUUID = function(uuid, options){
    var esClient = global.esClient;

    options = _.merge({}, {
        id: false,
        markdown: true
    }, options);

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
        if(options.markdown){
            source.description = global.showdown.makeHtml(source.description);
        }
        if(options.id){
            source.id = hit._id;
        }
        return source;
    })).first();

    return link;
};

linkService.prototype.createLink = function(user, link){
    var esClient = global.esClient;

    link.uuid = uuid.v1();
    link.created_date = moment().toDate();
    link.creator_id = user.id;

    esClient.indexSync({
        index: 'nodelicious',
        type: 'links',
        body: link
    });

    return link;
};

linkService.prototype.updateLink = function(user, link){
    var me = this,
        esClient = global.esClient,
        fromEs = me.getLinkByUUID(link.uuid, {id: true});

    link.creator_id = fromEs.creator_id;

    if(user.id != link.creator_id){
        throw new Error('Permission errors');
    }

    esClient.updateSync({
        index: 'nodelicious',
        type: 'links',
        id: fromEs.id,
        body: {
            doc: link
        }
    });

    return link;
};

linkService.prototype.deleteLinkByUUID = function(user, uuid){
    var esClient = global.esClient;

    var link = this.getLinkByUUID(uuid, {id: true});

    esClient.deleteSync({
        index: 'nodelicious',
        type: 'links',
        id: link.id
    });
};

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

module.exports = new linkService();