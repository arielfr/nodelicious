/**
 * Created by arey on 3/21/17.
 */
const config = require('config');
const {MongoClient} = require('mongodb');

const mongoServer = 'mongodb://' + config.get('mongo.host') + ':' + config.get('mongo.port') + '/' + config.get('mongo.database');

module.exports = {
  connect: function () {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoServer, (err, db) => {
          if (err) reject(err);
          resolve(db);
        });
      }
    )
  }

};