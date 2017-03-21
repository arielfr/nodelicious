const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');
const config = require('config');

let configLogs = config.get('bunyan-log');

for (let log in configLogs) {
  if (configLogs[log].stream !== undefined) {
    configLogs[log].stream = getStreams(configLogs[log].stream);
  }
}

const logger = bunyan.createLogger({
  name: 'nodelicious',
  streams: configLogs
});

module.exports = logger;

/**
 * This is created if the stream could be different (Ex.: Loggly on Production)
 * @param configurationStream
 * @returns {PrettyStream|exports|module.exports}
 */
function getStreams(configurationStream) {
  if (configurationStream == 'stdout-pretty') {
    const prettyStdOut = new PrettyStream();
    prettyStdOut.pipe(process.stdout);
    return prettyStdOut
  } else {
    return process.stdout;
  }
};