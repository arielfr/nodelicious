const bodyBuilder = require('bodybuilder');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const moment = require('moment');
const uuid = require('node-uuid');
const sync = require('synchronize');
const showdownConverter = require('../initializers/showdown');

let linkService = {};

linkService.getLinks = function (user, from, size, options) {
  options = _.merge({}, {
    id: false,
    markdown: true,
    filters: {}
  }, options);

  const me = this;
  const esClient = global.esClient;
  const from = (from) ? from : 0;
  const size = (size) ? size : 25;
  const getPrivate = (user) ? true : false;

  let query = {};

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
        "should": [],
        "must": [
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

  if (getPrivate) {
    query.query.bool.must = [];

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

  //Adding filters
  if (!_.isEmpty(options.filters)) {
    if (options.filters.tags) {
      query.query.bool.must.push({
        "terms": {
          "tags": options.filters.tags
        }
      });
    }
    if (options.filters.text) {
      query.query.bool.must.push({
        "query_string": {
          "fields": ["title", "link", "description", "tags"],
          "query": options.filters.text
        }
      });
    }
  }

  console.log(JSON.stringify(query));

  const results = esClient.searchSync({
    index: 'nodelicious',
    type: 'links',
    body: query
  });

  //Add the id to the user element
  const links = _(_(results.hits.hits).map(function (hit) {
    return me.sanitizeLink(hit._source, hit._id, user, options);
  })).value();

  return {
    links: links,
    total: results.hits.total
  };
};

linkService.getLinkByUUID = function (uuid, user, options) {
  const me = this;
  const esClient = global.esClient;

  options = _.merge({}, {
    id: false,
    markdown: true
  }, options);

  let link = esClient.searchSync({
    index: 'nodelicious',
    type: 'links',
    body: new bodyBuilder().filter('term', 'uuid', uuid).build()
  }).hits.hits;

  //Add the id to the user element
  link = _(_(link).map(function (hit) {
    return me.sanitizeLink(hit._source, hit._id, user, options);
  })).first();

  return link;
};

linkService.getLinksTotal = function (user) {
  const me = this;
  const esClient = global.esClient;
  const getPrivate = (user) ? true : false;

  var query = {
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

  if (getPrivate) {
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

  const totalLinks = esClient.countSync({
    index: 'nodelicious',
    type: 'links',
    body: query
  }).count;

  return totalLinks;
};

linkService.createLink = function (user, link) {
  const esClient = global.esClient;

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

linkService.updateLink = function (user, link) {
  const me = this;
  const esClient = global.esClient;
  const fromEs = me.getLinkByUUID(link.uuid, user, {id: true});

  link.creator_id = fromEs.creator_id;

  if (user.id != link.creator_id) {
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

linkService.deleteLinkByUUID = function (user, uuid) {
  const esClient = global.esClient;
  const link = this.getLinkByUUID(uuid, user, {id: true});

  esClient.deleteSync({
    index: 'nodelicious',
    type: 'links',
    id: link.id
  });

  sync.await(setTimeout(sync.defer(), global.config.get('elasticsearch.delay')));
};

linkService.getTagsCount = function (user) {
  const esClient = global.esClient;

  let query = {
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

  if (user) {
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
  } else {
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

  const tags = esClient.searchSync({
    index: 'nodelicious',
    type: 'links',
    body: query
  });

  const buckets = tags.aggregations.tags.buckets;

  const tagCloud = [];

  if (!_.isEmpty(buckets)) {
    _.forEach(buckets, function (bucket) {
      const font = 14 + (bucket.doc_count * 0.3);

      tagCloud.push({
        key: bucket.key,
        count: bucket.doc_count,
        font: ((font > 70) ? 70 : font) + 'px'
      });
    });
  }

  return tagCloud;
};

linkService.sanitizeLink = function (link, id, user, options) {
  if (_.isEmpty(link.tags)) {
    delete link.tags;
  }

  //Convert to HTML with markdown
  if (options.markdown) {
    link.description = showdownConverter.makeHtml(link.description);
  }

  link.isOwner = (user) ? ((user.id == link.creator_id) ? true : false) : false;

  if (options.id) {
    link.id = id;
  }

  return link;
};

module.exports = linkService;