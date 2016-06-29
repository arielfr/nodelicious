var elasticsearch = require('elasticsearch'),
    syncHelper = require('synchronize-helper');

module.exports = function(app){
    //Create Elasticsearch Client
    var esClient = new elasticsearch.Client({
        host: global.config.get('elasticsearch.host')
    });

    syncHelper(esClient);
    syncHelper(esClient.indices);
    syncHelper(esClient.nodes);
    syncHelper(esClient.cluster);

    global.esClient = esClient;
};