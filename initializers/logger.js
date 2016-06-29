var bunyan = require('bunyan'),
    PrettyStream = require('bunyan-prettystream');

module.exports = function(app){
    var configLogs = global.config.get('bunyan-log');

    for(log in configLogs){
        if( configLogs[log].stream !== undefined ){
            configLogs[log].stream = getStreams(configLogs[log].stream);
        }
    }

    global.log = bunyan.createLogger({
        name: 'api-front',
        streams: configLogs
    });
};

/**
 * This is created if the stream could be different (Ex.: Loggly on Production)
 * @param configurationStream
 * @returns {PrettyStream|exports|module.exports}
 */
var getStreams = function(configurationStream){
    if( configurationStream == 'stdout-pretty' ){
        var prettyStdOut = new PrettyStream();
        prettyStdOut.pipe(process.stdout);
        return prettyStdOut
    }else{
        return process.stdout;
    }
};