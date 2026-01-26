"use strict;"

const net = require('net'),
  package = require('../package.json'),
  Entry = require('../models/entry.js');

const Self = {
  // skkサービス
  skk: (connection) => {
    connection.on('data', async (data) => {
      console.log('request: ' + data );
      const request = data.toString(),
        command = request.substr(0, 1);

      switch(command) {
        case '0': // サーバへコネクションを切断するよう要求
          console.log(`connection closed!`);
          connection.write(`1/connection closed!/\n`);
          connection.destroy();
          break;
        case '1': // 「見出し」 eee に対する「変換文字列」を要求します
          const yomi = request.substr(1).trim(); // trimで末尾のスペースを除去する
          if(yomi.startsWith("(")) { // "("から始まる文字列はLisp式として評価
            const replaced = yomi.replace(new RegExp("_", 'g'), " ");
            try {
              const answer = await Entry.runLisp(replaced);
              if(Array.isArray(answer)) {
                const candidates = answer.join("/");
                console.log(`response: ${candidates}`);
                connection.write(`1/${candidates}/\n`);
              } else {
                console.log(`response: ${answer}`);
                connection.write(`1/${answer}/\n`);
              }
            } catch (errMessage) {
              console.log(`err: ${errMessage}`);
              connection.write(`4${errMessage}`);
            }
          } else {
            try {
              const response = await Entry.henkan(yomi);
              const candidates = response.join("/");
              console.log(`response: ${candidates}`);
              connection.write(`1/${candidates}/\n`);
            } catch (err) {
              connection.write(err);
            }
          }
          break;
        case '2':
          const response = `${package.version} `
          console.log(`response: ${response}`);
          connection.write(response);
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
          connection.write(`4${command}`);
          // throw new Error(`Unknown protocol: ${command}`);
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
