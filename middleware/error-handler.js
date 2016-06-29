var errors = require('errors');

module.exports = function(app){
    app.use(errorHandler);
};

function errorHandler(err, req, res, next){
    var error;

    global.log.debug(err);

    if( err instanceof Error && err.name == 'Error' ){
        error = new errors.Http500Error(err.toString());
    }else{
        error = err;
    }

    if( error.code == 404 ){
        res.render('404');
    }else{
        res.render('500');
    }
};