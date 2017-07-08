"use strict;"


const service = require('./lib/service.js').create();

service.listen(11111, '127.0.0.1', () => {
  const addr = service.address();
  console.log(`Listening Start on Server - ${addr.address}:${addr.port}`);
});

