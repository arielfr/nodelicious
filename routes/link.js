var express = require('express'),
    link = express.Router(),
    _ = require('lodash'),
    moment = require('moment'),
    linkService = require('../services/links'),
    authFilter = require('../middleware/authentication-filter'),
    urlRegex = require('url-regex'),
    sync = require('synchronize'),
    request = require('sync-request'),
    uuid = require('node-uuid');

/**
 * Add Link
 */
link.get('/link/add', authFilter.loggedIn, function(req, res, next){
    var model = {};

    model.uuid = uuid.v1();
    model.error = req.flash('error');

    res.renderSync('link/add', model);
});

/**
 * Create new link
 */
link.get('/link/new', authFilter.loggedIn, function(req, res, next){
    var model = {},
        body = _(req.flash('body')).first(),
        fromForm = _.merge({}, body),
        url = req.query.url,
        uuid = req.query.uuid;

    //If it is the first time you enter, public is true by default
    if(_.isEmpty(fromForm)){
        fromForm.public = true;
    }

    fromForm.uuid = (uuid) ? uuid : uuid.v1();

    //If the url is empty it is a snippet
    fromForm.snippet = (url) ? false : true;

    if(fromForm.url){
        fromForm.url = fromForm.url;
    }else{
        if(url){
            fromForm.url = decodeURI(url);
        }else{
            fromForm.description = 'Note: ';
        }
    }

    if( fromForm.url && urlRegex().test(fromForm.url) ){
        var titleRegex = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi,
            descriptionRegex = /<meta[^>]*name=[\"|\']description[\"|\'][^>]*content=[\"]([^\"]*)[\"][^>]*>/i;

        try{
            var response = request('GET', fromForm.url, {
                    timeout: 8000
                }),
                pageContent = response.body.toString(),
                titleMatch = titleRegex.exec(pageContent),
                descriptionMatch = descriptionRegex.exec(pageContent);

            if (titleMatch && titleMatch[2]) {
                fromForm.title = titleMatch[2];
            }

            if (descriptionMatch && descriptionMatch[1]) {
                fromForm.description = descriptionMatch[1];
            }
        }catch(e){
        }
    }

    //What page to redirect page in case of error
    model.action = 'new';
    model.body = fromForm;
    model.error = req.flash('error');

    res.renderSync('link/editor', model);
});

/**
 * Show link
 */
link.get('/link/view', function(req, res, next){
    var model = {},
        user = req.user,
        uuid = req.query.uuid,
        link = linkService.getLinkByUUID(uuid, user, {});

    if( !link.public ){
        if(!user){
            req.flash('error', 'This link is private');
            return res.redirect('/');
        }
        if( user && (user.id != link.creator_id) ){
            req.flash('error', 'You are not the owner of that link');
            return res.redirect('/');
        }
    }

    if( _.isEmpty(link) ){
        return res.redirect('/');
    }

    model.link = link;

    res.renderSync('link/view', model);
});

/**
 * Edit link
 */
link.get('/link/edit', authFilter.loggedIn, function(req, res, next){
    var model = {},
        user = req.user,
        uuid = req.query.uuid,
        body = _(req.flash('body')).first(),
        fromForm = _.merge({}, body),
        link = linkService.getLinkByUUID(uuid, user, { markdown: false });

    if( _.isEmpty(link) ){
        return res.redirect('/');
    }

    if(user.id != link.creator_id){
        req.flash('error', 'You are not the owner of that link');
        return res.redirect('/');
    }

    if(_.isEmpty(fromForm)){
        fromForm = _.merge(fromForm, link);
    }

    model.action = 'edit';
    model.error = req.flash('error');
    model.body = fromForm;
    model.body.uuid = uuid;

    res.renderSync('link/editor', model);
});

/**
 * Delete link
 */
link.get('/link/delete', function(req, res, next){
    var user = req.user,
        uuid = req.query.uuid,
        link = linkService.deleteLinkByUUID(user, uuid);

    if( _.isEmpty(link) ){
        return res.redirect('/');
    }

    if(user.id != link.creator_id){
        req.flash('error', 'You are not the owner of that link');
        return res.redirect('/');
    }

    return res.redirect('/');
});

/**
 * Save link
 */
link.post('/link/save', authFilter.loggedIn, function(req, res, next){
    var url = req.body.url,
        title = req.body.title,
        description = req.body.description,
        tags = req.body.tags,
        isPublic = (req.body.public) ? true : false,
        isSnippet = (req.body.snippet) ? true : false,
        uuid = req.body.uuid,
        action = (req.body.action) ? req.body.action : 'new',
        error = false,
        link;

    if((!url || !title) && !isSnippet){
        req.flash('error', 'Url and Title and mandatory fields');
        error = true;
    }

    if((!title || !description) && isSnippet){
        req.flash('error', 'If it is a code snippet or a note, title and description are mandatory');
        error = true;
    }

    if(error){
        req.flash('body', req.body);

        if(action == 'edit'){
            return res.redirect('/link/' + action + '?uuid=' + req.body.uuid);
        }
        return res.redirect('/link/' + action);
    }

    var linkToSave = {
        url: url,
        title: title,
        description: description,
        public: isPublic,
        snippet: isSnippet
    };

    //If it has to update
    if(uuid){
        linkToSave.uuid = uuid;
    }

    //Remove whitespaces and lower case all the tags
    var tagSanitazed = tags.toLowerCase().replace(/ /g,'');

    if(tagSanitazed.length > 0){
        linkToSave.tags = tagSanitazed.split(',');
    }

    if(action == 'new'){
        link = linkService.createLink(req.user, linkToSave);
    }else{
        link = linkService.updateLink(req.user, linkToSave);
    }

    return res.redirect('/link/view?uuid=' + link.uuid);
});

module.exports = link;