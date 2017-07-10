"use strict;"


const service = require('./lib/service.js').create();

const config = require('./lib/config.js'),
  env = process.env.NODE_ENV || 'test';
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

mongoose.connect(config(env).db.mongo.uri,  {
  useMongoClient: true,
  promiseLibrary: require('bluebird') 
});

service.listen(11111, '127.0.0.1', () => {
  const addr = service.address();
  console.log(`Listening Start on Server - ${addr.address}:${addr.port}`);
});

