const express = require('express');
const index = express.Router();
const _ = require('lodash');
const moment = require('moment');
const linkService = require('../services/links');

index.get('/tagcloud', function (req, res, next) {
  linkService.getTagsCount(req.user).then(cloud => {
    const model = {
      cloud: cloud
    };

    res.customRender('tagcloud', model);
  });
});

module.exports = index;