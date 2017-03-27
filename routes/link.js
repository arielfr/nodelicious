const express = require('express');
const _ = require('lodash');
const moment = require('moment');
const linkService = require('../services/links');
const authFilter = require('../middleware/authentication-filter');
const urlRegex = require('url-regex');
const request = require('sync-request');
const uuid = require('node-uuid');

const link = express.Router();

/**
 * Add Link
 */
link.get('/link/add', authFilter.loggedIn, function (req, res, next) {
  const model = {
    uuid: uuid.v1(),
    error: req.flash('error')
  };

  res.customRender('link/add', model);
});

/**
 * Create new link
 */
link.get('/link/new', authFilter.loggedIn, function (req, res, next) {
  var model = {},
    body = _(req.flash('body')).first(),
    fromForm = _.merge({}, body),
    url = req.query.url,
    uuid = req.query.uuid;

  //If it is the first time you enter, public is true by default
  if (_.isEmpty(fromForm)) {
    fromForm.public = true;
  }

  fromForm.uuid = (uuid) ? uuid : uuid.v1();

  //If the url is empty it is a snippet
  fromForm.snippet = (url) ? false : true;

  if (fromForm.url) {
    fromForm.url = fromForm.url;
  } else {
    if (url) {
      fromForm.url = decodeURI(url);
    } else {
      fromForm.description = 'Note: ';
    }
  }

  if (fromForm.url && urlRegex().test(fromForm.url)) {
    const titleRegex = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;
    const descriptionRegex = /<meta[^>]*name=[\"|\']description[\"|\'][^>]*content=[\"]([^\"]*)[\"][^>]*>/i;

    try {
      const response = request('GET', fromForm.url, {
        timeout: 8000
      });
      const pageContent = response.body.toString();
      const titleMatch = titleRegex.exec(pageContent);
      const descriptionMatch = descriptionRegex.exec(pageContent);

      if (titleMatch && titleMatch[2]) {
        fromForm.title = titleMatch[2];
      }

      if (descriptionMatch && descriptionMatch[1]) {
        fromForm.description = descriptionMatch[1];
      }
    } catch (e) {
    }
  }

  //What page to redirect page in case of error
  model.action = 'new';
  model.body = fromForm;
  model.error = req.flash('error');

  res.customRender('link/editor', model);
});

/**
 * Show link
 */
link.get('/link/view', function (req, res, next) {
  let model = {};
  const user = req.user;
  const uuid = req.query.uuid;


  linkService.getLinkByUUID(uuid, user, {}).then(link => {
    if (!link.public) {
      if (!user) {
        req.flash('error', 'This link is private');
        return res.redirect('/');
      }
      if (user && (user._id != link.creator_id)) {
        req.flash('error', 'You are not the owner of that link');
        return res.redirect('/');
      }
    }

    if (_.isEmpty(link)) {
      return res.redirect('/');
    }

    model.link = link;

    res.customRender('link/view', model);
  });
});

/**
 * Edit link
 */
link.get('/link/edit', authFilter.loggedIn, function (req, res, next) {
  const model = {};
  const user = req.user;
  const uuid = req.query.uuid;
  const body = _(req.flash('body')).first();
  let fromForm = Object.assign({}, body);

  linkService.getLinkByUUID(uuid, user, {markdown: false}).then(link => {
    if (_.isEmpty(link)) {
      return res.redirect('/');
    }

    if (user._id != link.creator_id) {
      req.flash('error', 'You are not the owner of that link');
      return res.redirect('/');
    }

    if (_.isEmpty(fromForm)) {
      fromForm = _.merge(fromForm, link);
    }

    model.action = 'edit';
    model.error = req.flash('error');
    model.body = fromForm;
    model.body.uuid = uuid;

    res.customRender('link/editor', model);
  });
});

/**
 * Delete link
 */
link.get('/link/delete', function (req, res, next) {
  const user = req.user;
  const uuid = req.query.uuid;
  const link = linkService.deleteLinkByUUID(user, uuid);

  if (_.isEmpty(link)) {
    return res.redirect('/');
  }

  if (user._id != link.creator_id) {
    req.flash('error', 'You are not the owner of that link');
    return res.redirect('/');
  }

  return res.redirect('/');
});

/**
 * Save link
 */
link.post('/link/save', authFilter.loggedIn, function (req, res, next) {
  const url = req.body.url;
  const title = req.body.title;
  const description = req.body.description;
  const tags = req.body.tags;
  const isPublic = (req.body.public === 'on') ? true : false;
  const isSnippet = (req.body.snippet === 'true') ? true : false;
  const uuid = req.body.uuid;
  const action = (req.body.action) ? req.body.action : 'new';
  let error = false;
  let link;

  if ((!url || !title) && !isSnippet) {
    req.flash('error', 'Url and Title and mandatory fields');
    error = true;
  }

  if ((!title || !description) && isSnippet) {
    req.flash('error', 'If it is a code snippet or a note, title and description are mandatory');
    error = true;
  }

  if (error) {
    req.flash('body', req.body);

    if (req.body.uuid) {
      return res.redirect('/link/' + action + '?uuid=' + req.body.uuid);
    }
    return res.redirect('/link/' + action);
  }

  let linkToSave = {
    url: url,
    title: title,
    description: description,
    public: isPublic,
    snippet: isSnippet
  };

  //If it has to update
  if (uuid) {
    linkToSave.uuid = uuid;
  }

  //Remove whitespaces and lower case all the tags
  const tagSanitazed = tags.toLowerCase().replace(/ /g, '');

  if (tagSanitazed.length > 0) {
    linkToSave.tags = tagSanitazed.split(',');
  }

  let promiseAction;

  if (action == 'new') {
    promiseAction = linkService.createLink(req.user, linkToSave);
  } else {
    promiseAction = linkService.updateLink(req.user, linkToSave);
  }

  promiseAction.then(link => {
    res.redirect('/link/view?uuid=' + link.uuid);
  });
});

module.exports = link;