var express = require('express'),
    index = express.Router(),
    _ = require('lodash'),
    moment = require('moment');

index.get('/', function(req, res, next){
    res.renderSync('index', {});
});

module.exports = index;