const bcrypt = require('bcrypt');
const moment = require('moment');
const uuid = require('node-uuid');
const mongo = require('../initializers/mongo');

const userService = {};

userService.getUserByEmail = function (email) {
  return new Promise((resolve, reject) => {
    mongo.connect().then(db => {
      const usersCollection = db.collection('users');

      usersCollection.find({
        email: email.toLowerCase()
      }).toArray().then(users => {
        const user = (users !== null) ? users[0] : {};

        resolve(user);

        db.close();
      });
    }).catch(err => {
      reject(err);
    });
  });
};

userService.registerUser = function (user) {
  return new Promise((resolve, reject) => {
    mongo.connect().then(db => {
      const usersCollection = db.collection('users');

      //Lowercase the email
      user.uuid = uuid.v1();
      user.email = user.email.toLowerCase();
      user.password = bcrypt.hashSync(user.password, 10);
      user.created_date = moment().toDate();

      usersCollection.insertOne(user).then(response => {
        resolve(user);

        db.close();
      });
    }).catch(err => {
      reject(err);
    });
  });
};

module.exports = userService;