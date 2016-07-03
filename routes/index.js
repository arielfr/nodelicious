var express = require('express'),
    index = express.Router(),
    _ = require('lodash'),
    moment = require('moment');

index.get('/', function(req, res, next){
    if(req.user){
        res.renderSync('index', {});
    }else{
        res.renderSync('login', {});
    }
});

module.exports = index;