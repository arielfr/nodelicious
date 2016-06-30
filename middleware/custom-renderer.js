var sync = require('synchronize'),
    _ = require('lodash'),
    defer = sync.defer,
    await = sync.await;

module.exports = function(app){
    var defaultModel = {
        title: global.config.get('page.title'),
        navbar: {
            title: global.config.get('page.navbar.title')
        }
    };

    //This will append defualt configuration to all models
    function loadDefaultModel(model){
        //Override the default keys with the ones on the model
        //_.merge({}, { a: 'a'  }, { a: undefined }) // => { a: "a" }
        //_.merge({}, { a: 'a'  }, { a: bb }) // => { a: "bb" }
        model = _.merge({}, defaultModel, model);

        return model;
    }

    app.use(function(req, res, next){
        res.renderSync = function(view, model){
            model = loadDefaultModel(model);
            var pageRender = await(res.render(view, model, defer()));
            res.send(pageRender);
        };

        next();
    });
};