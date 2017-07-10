"use strict;"

const config = require('./lib/config.js'),
  env = process.env.NODE_ENV,
  mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

mongoose.connect(config(env).db.mongo.uri,  {
  useMongoClient: true,
  promiseLibrary: require('bluebird') 
});

const net = require('net');
const skkService = require('./lib/service.js').skk;
const server = net.createServer(skkService);

server.listen(11111, '127.0.0.1', () => {
  const addr = server.address();
  console.log(`Listening Start on Server - ${addr.address}:${addr.port}`);
  console.log(`MongoDB - ${config(env).db.mongo.uri} connected`);
});

