var showdown = require('showdown');
require('showdown-youtube')

module.exports = function(app){
    global.showdown = new showdown.Converter({
        extensions: ['youtube']
    });
};