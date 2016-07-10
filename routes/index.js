var express = require('express'),
    index = express.Router(),
    _ = require('lodash'),
    moment = require('moment'),
    linkService = require('../services/links');

index.get('/', function(req, res, next){
    var model = {};

    model.links = linkService.getLinks(req.user);

    res.renderSync('index', model);
});

module.exports = index;