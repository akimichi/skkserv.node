"use strict;"

const env = process.env.NODE_ENV,
  config = require('./lib/config.js')(env);

const net = require('net');
const dictionary = require('./lib/dictionary.js');
const skkService = require('./lib/service.js').skk;
const server = net.createServer(skkService),
  port = config.port;

// 辞書ファイルのパスリスト
const dictionaryFiles = [
  './resource/SKK-JISYO.L',
  './resource/SKK-JISYO.drug',
  './resource/SKK-JISYO.fullname',
  './resource/SKK-JISYO.geo',
  './resource/SKK-JISYO.zipcode',
  './resource/SKK-JISYO.law',
  './resource/SKK-JISYO.station',
  './resource/SKK-JISYO.jinmei',
  './resource/SKK-JISYO.medical',
];

// 辞書を読み込み
console.log('Loading dictionary files...');
dictionary.load(dictionaryFiles);

server.listen(port, '0.0.0.0', () => {
  const addr = server.address();
  console.log(`Listening Start on Server - ${addr.address}:${addr.port}`);
});
