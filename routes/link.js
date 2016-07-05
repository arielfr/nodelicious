var express = require('express'),
    link = express.Router(),
    _ = require('lodash'),
    moment = require('moment'),
    linkService = require('../services/links');

link.get('/link/:action', function(req, res, next){
    var action = req.params.action,
        model = {};

    if(action == 'view'){
        link = linkService.getLinkByUUID(req.query.uuid);
        model.link = link;
    }

    model.action = action;
    model.error = req.flash('error');
    model.body = _(req.flash('body')).first();

    res.renderSync('link', model);
});

link.post('/link/new', function(req, res, next){
    var url = req.body.url,
        title = req.body.title,
        description = req.body.description,
        tags = req.body.tags,
        isPublic = (req.body.public) ? true : false,
        isSnippet = (req.body.snippet) ? true : false,
        error = false;

    if((!url || !title) && !isSnippet){
        req.flash('error', 'Url and Title and mandatory fields');
        error = true;
    }

    if((!title || !description) && isSnippet){
        req.flash('error', 'If it is a code snippet, title and description are mandatory');
        error = true;
    }

    if(error){
        req.flash('body', req.body);
        return res.redirect('/link/new');
    }

    var linkToSave = {
        url: url,
        title: title,
        description: description,
        public: isPublic,
        snippet: isSnippet
    };

    //Remove whitespaces and lower case all the tags
    var tagSanitazed = tags.toLowerCase().replace(/ /g,'');

    if(tagSanitazed.length > 0){
        linkToSave.tags = tagSanitazed.split(',');
    }

    var link = linkService.createLink(linkToSave);

    return res.redirect('/link/view?uuid=' + link.uuid);
});

module.exports = link;