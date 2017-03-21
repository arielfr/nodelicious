const showdown = require('showdown');
require('showdown-youtube');

const showDownConverter = new showdown.Converter({
  extensions: ['youtube']
});

module.exports = showDownConverter;