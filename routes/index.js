const express = require('express');
const _ = require('lodash');
const moment = require('moment');
const linkService = require('../services/links');
const utilService = require('../services/util');

const index = express.Router();

index.post('/search', function (req, res, next) {
  const text = req.body.text;

  if (!text) {
    res.redirect('/');
    return;
  }

  res.redirect(301, '/?text=' + utilService.toPathVariable(text));
});

index.get('/', function (req, res, next) {
  let model = {},
    tagFilter = (req.query.tag) ? (Array.isArray(req.query.tag)) ? req.query.tag.map(function (text) {
          return utilService.fixSpaces(text);
        }) : [utilService.fixSpaces(req.query.tag)] : req.query.tag,
    textFilter = (req.query.text) ? utilService.fixSpaces(req.query.text) : '';

  //Replace invalid characters
  textFilter = textFilter.replace(/[^a-zA-Z0-9\s\.\ñáéíóúÁÉÍÓÚ]*/g, '');

  const filters = {
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