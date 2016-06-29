var sync = require('synchronize');

module.exports = function(app){
    //Execute into a fiber the request
    app.use(function(req, res, next){
        sync.fiber(next);
    });
};
