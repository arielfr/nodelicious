var express = require('express'),
    index = express.Router(),
    _ = require('lodash'),
    moment = require('moment'),
    linkService = require('../services/links');

index.get('/', function(req, res, next){
    var model = {},
        tagFilter = (req.query.tag) ? (Array.isArray(req.query.tag)) ? req.query.tag : [req.query.tag] : req.query.tag,
        textFilter = req.query.text;

    model.links = linkService.getLinks(req.user, 0, 100, {
        filters: {
            tags: tagFilter,
            text: textFilter
        }
    });
    model.error = req.flash('error');

    res.renderSync('index', model);
});

module.exports = index;