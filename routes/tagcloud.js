const express = require('express');
const index = express.Router();
const _ = require('lodash');
const moment = require('moment');
const linkService = require('../services/links');

index.get('/tagcloud', function (req, res, next) {
  let model = {
    cloud: linkService.getTagsCount(req.user)
  };


  res.renderSync('tagcloud', model);
});

module.exports = index;