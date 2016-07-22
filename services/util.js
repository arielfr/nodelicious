var _ = require('lodash');

var service = function(){};

/**
 * Sanitize path variable
 * @param pathVariable
 * @returns {*}
 */
service.prototype.sanitizePathVariable = function(pathVariable){
    if(!pathVariable){
        return pathVariable;
    }
    return pathVariable.replace(/\s/g, "-").toLowerCase();
};

/**
 * Transform a string to path variable valid string
 * @param pathVariable
 * @returns {*}
 */
service.prototype.toPathVariable = function(pathVariable){
    if(!pathVariable){
        return pathVariable;
    }
    return encodeURI(pathVariable.replace(/\s/g, "-").toLowerCase());
};

module.exports = new service();