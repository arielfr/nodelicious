const _ = require('lodash');

const utils = {};

/**
 * Sanitize path variable
 * @param pathVariable
 * @returns {*}
 */
utils.sanitizePathVariable = function (pathVariable) {
  if (!pathVariable) {
    return pathVariable;
  }
  return pathVariable.replace(/\s/g, "-").toLowerCase();
};

/**
 * Transform a string to path variable valid string
 * @param pathVariable
 * @returns {*}
 */
utils.toPathVariable = function (pathVariable) {
  if (!pathVariable) {
    return pathVariable;
  }
  return encodeURI(pathVariable.replace(/\s/g, "-").toLowerCase());
};

/**
 * Fix the spaces that came from a path variable
 * @param pathVariable
 * @returns {*}
 */
utils.fixSpaces = function (pathVariable) {
  if (!pathVariable) {
    return pathVariable;
  }
  return pathVariable.replace(/\-/g, " ").toLowerCase();
};

module.exports = utils;