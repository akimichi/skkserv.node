'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const env = process.env.NODE_ENV || 'test',
  config = require('../lib/config.js')(env),
  uri = config.db.mongo.uri;

console.log(config)

before(function (done) {
  this.timeout('15s');
  const clearDB = () =>  {
    for (var i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove(() => {
      });
    }
    // return done();
  }

  if (mongoose.connection.readyState === 0) {
    const options = { 
      useMongoClient: true,
      promiseLibrary: require('bluebird') 
    };
    mongoose.connect(uri, options, (err) => {
      if (err) {
        throw err;
      }
      return clearDB();
    });
  } else {
    return clearDB();
  }
  done();
});


after((done) => {
  mongoose.disconnect();
  return done();
});
