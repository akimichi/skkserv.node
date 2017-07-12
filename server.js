"use strict;"

const mongoose = require('mongoose'),
  env = process.env.NODE_ENV,
  config = require('./lib/config.js')(env);
  
mongoose.Promise = require('bluebird');

mongoose.connect(config.db.mongo.uri,  {
  useMongoClient: true,
  promiseLibrary: require('bluebird') 
});

const net = require('net');
const skkService = require('./lib/service.js').skk;
const server = net.createServer(skkService),
 port = config.port;

server.listen(port, '127.0.0.1', () => {
  const addr = server.address();
  console.log(`Listening Start on Server - ${addr.address}:${addr.port}`);
  console.log(`MongoDB - ${config.db.mongo.uri} connected`);
});

