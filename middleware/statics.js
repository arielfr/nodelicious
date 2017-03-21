const express = require('express');

module.exports = function (app) {
  app.use('/js', express.static('./assets/js'));
  app.use('/css', express.static('./assets/css'));
  app.use('/images', express.static('./assets/images'));
  app.use('/fonts', express.static('./assets/fonts'));
};
