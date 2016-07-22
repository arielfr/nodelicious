var express = require('express'),
    index = express.Router(),
    _ = require('lodash'),
    moment = require('moment'),
    linkService = require('../services/links'),
    utilService = require('../services/util');

index.get('/', function(req, res, next){
    var model = {},
        tagFilter = (req.query.tag) ? (Array.isArray(req.query.tag)) ? req.query.tag.map(function(text){
            return utilService.fixSpaces(text);
        }) : [utilService.fixSpaces(req.query.tag)] : req.query.tag,
        textFilter = (req.query.text) ? utilService.fixSpaces(req.query.text) : req.query.text;

    var filters = {
        tags: tagFilter,
        text: textFilter
    };

    model.results = linkService.getLinks(req.user, 0, 100, {
        filters: filters
    });

    model.filters = filters;

    model.total = linkService.getLinksTotal(req.user);

    res.renderSync('index', model);
});

module.exports = index;