/**
 * Created by arey on 3/21/17.
 */
const logger = require('./initializers/logger');
const mongo = require('./initializers/mongo');

mongo.connect().then(db => {
  logger.info('Querying for existing collections');

  db.listCollections().toArray((err, collections) => {
    const existing = (collections !== null) ? collections : [];

    const existingCollNames = existing.map(collection => {
      return collection.name;
    });

    if (existingCollNames.indexOf('users')) {
      logger.info('Collection users doesnt exist. Creating it');

      db.createCollection('users', {
        validator: {
          $or: [
            {
              uuid: {
                $type: 'string'
              }
            },
            {
              firstname: {
                $type: 'string'
              }
            },
            {
              lastname: {
                $type: 'string'
              }
            },
            {
              email: {
                $type: 'string'
              }
            },
            {
              password: {
                $type: 'string'
              }
            },
            {
              created_date: {
                $type: 'date'
              }
            }
          ]
        }
      });
    }

    if (existingCollNames.indexOf('links')) {
      logger.info('Collection links doesnt exist. Creating it');

      db.createCollection('links', {
          validator: {
            $or: [
              {
                uuid: {
                  $type: 'string'
                }
              },
              {
                url: {
                  $type: 'string'
                }
              },
              {
                link: {
                  $type: 'string'
                }
              },
              {
                description: {
                  $type: 'string'
                }
              },
              {
                tags: {
                  $type: 'array'
                }
              },
              {
                public: {
                  $type: 'bool'
                }
              },
              {
                snippet: {
                  $type: 'bool'
                }
              },
              {
                created_date: {
                  $type: 'date'
                }
              },
              {
                creator_id: {
                  $type: 'string'
                }
              }
            ]
          }
        }
      ).then(result => {
        const linksCollection = db.collection('links');

        linksCollection.createIndex({
          title: 'text',
          description: 'text',
          link: 'text',
          tags: 'text'
        })
      });
    }

    logger.info('Creation Done');
  });
});