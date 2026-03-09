import net = require('net');

const env = process.env.NODE_ENV as string;
const config = require('./lib/config')(env);

import dictionary = require('./lib/dictionary');
import service = require('./lib/service');

const skkService = service.skk;
const server = net.createServer(skkService);
const port: number = config.port;

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

console.log('Loading dictionary files...');
dictionary.load(dictionaryFiles);

server.listen(port, '0.0.0.0', () => {
  const addr = server.address() as net.AddressInfo;
  console.log(`Listening Start on Server - ${addr.address}:${addr.port}`);
});
