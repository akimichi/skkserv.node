"use strict;"

const net = require('net');

module.exports = {
  create: () => {
    return net.createServer(connection => {
      connection.on('data', (data) => {
        console.log('incomming data: ' + data );
        // TCPコネクションに応答を書き込みます。クライアントはその書き込みを受信します。
        connection.write(data);
        // connection.write(`${data}`);
      });     
      connection.on('end', () => {
        console.log('connection closed.');
      });
      // 'errer'イベントハンドラー
      connection.on('error', (err) => {
        console.log('ERROR: ' + err.stack);
      });
    });
  },
};



