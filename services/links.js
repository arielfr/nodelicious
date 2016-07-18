var bodyBuilder = require('bodybuilder'),
    bcrypt = require('bcrypt'),
    _ = require('lodash'),
    moment = require('moment'),
    uuid = require('node-uuid'),
    sync = require('synchronize');

var linkService = function(){};

linkService.prototype.getLinks = function(user, from, size, options){
    options = _.merge({}, {
        id: false,
        markdown: true
    }, options);

    var me = this,
        esClient = global.esClient,
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
        return me.sanitizeLink(hit._source, hit._id, user, options);
    })).value();

    return links;
};

linkService.prototype.getLinkByUUID = function(uuid, user, options){
    var me = this,
        esClient = global.esClient;

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
        return me.sanitizeLink(hit._source, hit._id, user, options);
    })).first();

    return link;
};

linkService.prototype.createLink = function(user, link){
    var esClient = global.esClient;

    link.created_date = moment().toDate();
    link.creator_id = user.id;

    esClient.indexSync({
        index: 'nodelicious',
        type: 'links',
        body: link
    });

    sync.await(setTimeout(sync.defer(), global.config.get('elasticsearch.delay')));

    return link;
};

linkService.prototype.updateLink = function(user, link){
    var me = this,
        esClient = global.esClient,
        fromEs = me.getLinkByUUID(link.uuid, user, {id: true});

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

    sync.await(setTimeout(sync.defer(), global.config.get('elasticsearch.delay')));

    return link;
};

linkService.prototype.deleteLinkByUUID = function(user, uuid){
    var esClient = global.esClient;

    var link = this.getLinkByUUID(uuid, user, {id: true});

    esClient.deleteSync({
        index: 'nodelicious',
        type: 'links',
        id: link.id
    });

    sync.await(setTimeout(sync.defer(), global.config.get('elasticsearch.delay')));
};

linkService.prototype.getTagsCount = function(user){
    var esClient = global.esClient;

    var query = {
        "size": 0,
        "aggs": {
            "tags": {
                "terms": {
                    "field": "tags",
                    "size": 1000
                }
            }
        }
    };

    if(user){
        query.query = {
            "bool": {
                "should": [
                    {
                        "term": {
                            "public": {
                                "value": false
                            }
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public": {
                                            "value": true
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
                    }
                ]
            }
        }
    }else{
        query.query = {
            bool: {
                must: [
                    {
                        term: {
                            public: {
                                value: true
                            }
                        }
                    }
                ]
            }
        }
    }

    var tags = esClient.searchSync({
        index: 'nodelicious',
        type: 'links',
        body: query
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

linkService.prototype.sanitizeLink = function(link, id, user, options){
    if(_.isEmpty(link.tags)){
        delete link.tags;
    }

    //Convert to HTML with markdown
    if(options.markdown){
        link.description = global.showdown.makeHtml(link.description);
    }

    link.isOwner = (user) ? ((user.id == link.creator_id) ? true : false) : false;

    if(options.id){
        link.id = id;
    }

    return link;
};

module.exports = new linkService();