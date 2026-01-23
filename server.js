"use strict;"

const mongoose = require('mongoose'),
  env = process.env.NODE_ENV,
  config = require('./lib/config.js')(env);

const net = require('net');
const skkService = require('./lib/service.js').skk;
const server = net.createServer(skkService),
 port = config.port;

mongoose.connect(config.db.mongo.uri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connection Successful!");
});

server.listen(port, '0.0.0.0', () => {
  const addr = server.address();
  console.log(`Listening Start on Server - ${addr.address}:${addr.port}`);
  console.log(`MongoDB - ${config.db.mongo.uri} connected`);
});

