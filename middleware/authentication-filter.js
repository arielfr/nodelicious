var authFilter = function(){};

/**
 * Filter endpoints thats need to be logged in
 * @param req
 * @param res
 * @param next
 */
authFilter.prototype.loggedIn = function(req, res, next){
    if(req.user){
        next();
    }else{
        res.redirect('/login');
    }
};

/**
 * Filters endpoint that you dont have to be authenticated
 * @param req
 * @param res
 * @param next
 */
authFilter.prototype.notLoggedIn = function(req, res, next){
    if(req.user){
        res.redirect('/');
    }else{
        next();
    }
};

module.exports = new authFilter();