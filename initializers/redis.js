var redis = require('redis'),
    syncHelper = require('synchronize-helper');

module.exports = function(app){
    //Create Elasticsearch Client
    var redisClient = new redis.createClient({
        host: global.config.get('redis.host'),
        port: global.config.get('redis.port')
    });

    syncHelper(redisClient);

    global.redisClient = redisClient;
};