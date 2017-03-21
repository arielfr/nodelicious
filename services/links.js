const bcrypt = require('bcrypt');
const _ = require('lodash');
const moment = require('moment');
const uuid = require('node-uuid');
const showdownConverter = require('../initializers/showdown');
const mongo = require('../initializers/mongo');
const {ObjectID} = require('mongodb');

let linkService = {};

/**
 * Get links depending on options
 * @param user
 * @param from
 * @param size
 * @param options
 * @returns {Promise}
 */
linkService.getLinks = function (user, from, size, options) {
  return new Promise((resolve, reject) => {
    options = _.merge({}, {
      markdown: true,
      filters: {}
    }, options);

    mongo.connect().then(db => {
      let query = {};

      const linksCollection = db.collection('links');

      const getPrivate = !!(user);
      const fromSize = (from) ? from : 0;
      const toSize = (size) ? size : 25;

      query.public = true;

      // if you are logged show only your links
      if (getPrivate) {
        delete query.public;

        query['$and'] = [
          {
            creator_id: user.id
          }
        ];
      }

      //Adding filters
      if (!_.isEmpty(options.filters)) {
        if (options.filters.tags) {
          query['$and'].push({
            tags: {
              $in: options.filters.tags
            }
          });
        }

        if (options.filters.text) {
          query['$and'].push({
            $text: {
              $search: options.filters.text
            }
          });
        }
      }

      linksCollection.find(query).sort({
        created_date: -1
      }).skip(fromSize).limit(toSize).toArray().then(links => {
        links = (links !== null) ? links : [];

        //Add the id to the user element
        links = links.map((link) => {
          return this.sanitizeLink(link, link._id, user, options);
        });

        resolve({
          links: links,
          total: links.length
        })
      });
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * Get link by uuid
 * @param uuid
 * @param user
 * @param options
 * @returns {Promise}
 */
linkService.getLinkByUUID = function (uuid, user, options) {
  return new Promise((resolve, reject) => {
    options = _.merge({}, {
      markdown: true
    }, options);

    mongo.connect().then(db => {
      const linksCollection = db.collection('links');

      linksCollection.find({
        uuid: uuid
      }).limit(1).toArray().then(links => {
        let linkToUpdate;

        if (links !== null) {
          linkToUpdate = links[0];

          this.sanitizeLink(linkToUpdate, linkToUpdate._id, user, options);
        } else {
          linkToUpdate = {};
        }

        resolve(linkToUpdate);
      });
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * Get total links on collection
 * @param user
 * @returns {Promise}
 */
linkService.getLinksTotal = function (user) {
  return new Promise((resolve, reject) => {
    mongo.connect().then(db => {
      let query = {};

      const linksCollection = db.collection('links');

      const getPrivate = !!(user);

      query.public = true;

      // if you are logged show only your links
      if (getPrivate) {
        delete query.public;

        query['$and'] = [
          {
            creator_id: user.id
          }
        ];
      }

      linksCollection.find(query).count().then(count => {
        const total = (count !== null) ? count : 0;

        resolve(total);
      });
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * Create Link
 * @param user
 * @param link
 * @returns {Promise}
 */
linkService.createLink = function (user, link) {
  return new Promise((resolve, reject) => {
    mongo.connect().then(db => {
      const linksCollection = db.collection('links');

      link.created_date = moment().toDate();
      link.creator_id = user.id;

      linksCollection.insertOne(link).then(response => {
        resolve(link);

        db.close();
      });
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * Update link
 * @param user
 * @param link
 * @returns {Promise}
 */
linkService.updateLink = function (user, link) {
  return new Promise((resolve, reject) => {
    mongo.connect().then(db => {
      const linksCollection = db.collection('links');

      this.getLinkByUUID(link.uuid, user, {}).then(existingLink => {
        if (user.id != existingLink.creator_id) {
          throw new Error('Permission error');
        }

        linksCollection.updateOne({
            _id: new ObjectID(existingLink._id),
          },
          {
            $set: link
          }).then(response => {
          resolve(link);
          db.close();
        });
      });
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * Delete Link
 * @param user
 * @param uuid
 * @returns {Promise}
 */
linkService.deleteLinkByUUID = function (user, uuid) {
  return new Promise((resolve, reject) => {
    mongo.connect().then(db => {
      const linksCollection = db.collection('links');

      this.getLinkByUUID(uuid, user, {}).then(existingLink => {
        if (user.id != existingLink.creator_id) {
          throw new Error('Permission errors');
        }

        linksCollection.deleteOne({
          _id: new ObjectID(existingLink._id)
        }).then(response => {
          resolve(true);
          db.close();
        });
      });
    }).catch(err => {
      reject(err);
    });
  });
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

  return link;
};

module.exports = linkService;