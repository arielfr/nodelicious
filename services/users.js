const bodyBuilder = require('bodybuilder');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const moment = require('moment');
const uuid = require('node-uuid');
const sync = require('synchronize');

const userService = {};

userService.getUserByEmail = function (email) {
  const esClient = global.esClient;

  let user = esClient.searchSync({
    index: 'nodelicious',
    type: 'users',
    body: new bodyBuilder().filter('term', 'email', email.toLowerCase()).build()
  }).hits.hits;

  //Add the id to the user element
  user = _(_(user).map(function (element) {
    let source = element._source;
    //Adding id to the user model
    source.id = element._id;
    return source;
  })).first();

  return user;
};

userService.registerUser = function (user) {
  const esClient = global.esClient;

  //Lowercase the email
  user.uuid = uuid.v1();
  user.email = user.email.toLowerCase();
  user.password = bcrypt.hashSync(user.password, 10);
  user.created_date = moment().toDate();

  const registeredUser = esClient.indexSync({
    index: 'nodelicious',
    type: 'users',
    body: user
  });

  //Adding the id indexed to the user that is going to be logged in
  user.id = registeredUser._id;

  sync.await(setTimeout(sync.defer(), global.config.get('elasticsearch.delay')));

  return user;
};

module.exports = userService;