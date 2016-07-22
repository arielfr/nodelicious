var express = require('express'),
    index = express.Router(),
    _ = require('lodash'),
    moment = require('moment'),
    linkService = require('../services/links');

index.get('/tagcloud', function(req, res, next){
    var model = {};

    model.cloud = linkService.getTagsCount(req.user);

    res.renderSync('tagcloud', model);
});

module.exports = index;