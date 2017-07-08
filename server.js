"use strict;"


const net = require('net');



const server = net.createServer(connection => {
    connection.on('end', () => {
      console.log('connection closed.');
    });


});


server.listen(11111, '127.0.0.1', () => {
  const addr = server.address();
  console.log(`Listening Start on Server - ${addr.address}:${addr.port}`);

});

