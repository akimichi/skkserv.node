"use strict;"

const net = require('net'),
  package = require('../package.json'),
  Entry = require('../models/entry.js');

const Self = {
  // skkサービス
  skk: (connection) => {
    connection.on('data', (data) => {
      console.log('request: ' + data );
      const request = data.toString(),
        command = request.substr(0, 1);

      switch(command) {
        case '0': // サーバへコネクションを切断するよう要求
          connection.destroy();
          break;
        case '1': // 「見出し」 eee に対する「変換文字列」を要求します
          const yomi = request.substr(1).trim(); // trimで末尾のスペースを除去する
          Entry.henkan(yomi, (err, response) => {
            console.log(`response: ${response}`);
            if(err) {
              connection.write(response);
            } else {
              connection.write(response);
            }
          });
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
          // 「見出し」 eee で始まる見出しを要求します
          // case '4':
          //   break; 
        default:
          throw new Error(`Unknown protocol: ${command}`);
      }
    });
    connection.on('end', () => {
      console.log('connection closed.');
    });
    // 'errer'イベントハンドラー
    connection.on('error', (err) => {
      console.log('ERROR: ' + err.stack);
    });
  },
  // echoサービス
  echo: (connection) => {
    connection.on('data', (data) => {
      const request = data.toString();
      // TCPコネクションに応答を書き込みます。クライアントはその書き込みを受信します。
      connection.write(request);
    });
    connection.on('end', () => {
      console.log('connection closed.');
    });
    // 'errer'イベントハンドラー
    connection.on('error', (err) => {
      console.log('ERROR: ' + err.stack);
    });
  }
};



module.exports = Self;
