"use strict;"

const net = require('net');
const package = require('../package.json');

module.exports = {
  create: () => {
    return net.createServer(connection => {
      connection.on('data', (data) => {
        console.log('incomming data: ' + data );
        const request = data.toString();
        const command = request.substr(0, 1);

        switch(command) {
          case '0': // サーバへコネクションを切断するよう要求
            connection.close();
            break;
          case '1': // 「見出し」 eee に対する「変換文字列」を要求します
            const key = request.substr(1);
            connection.write(key);
            break; 
          case '2':
            connection.write(package.version + ' ');
            break; 
            // case '3':
            // 	res = os.hostname() + ':' + c.localAddress + ' ';
            // 	c.write(res);
            // 	break;
            // case '4':
            // 	break;
          default:
            return {
              type: 'error'
            };
        }
      });
        // // TCPコネクションに応答を書き込みます。クライアントはその書き込みを受信します。
        // connection.write(data);
        // // connection.write(`${data}`);
      // });     
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



