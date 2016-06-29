module.exports = function(app){
    app.use(function(req, res, next){
        //Do not log static urls
        var regex = /^\/(css|js|fonts|images)\//;

        if(!regex.test(req.url)){
            global.log.info('[%s] %s', req.method, req.url);
        }

        next();
    });
};