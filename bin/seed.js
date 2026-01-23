'use strict';

// Usage:
//
// $ NODE_ENV=development node bin/seed.js
// $ NODE_ENV=test node bin/seed.js
//

const env = process.env.NODE_ENV,
 config = require('../lib/config.js')(env),
 uri = config.db.mongo.uri;

const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const Entry = require('../models/entry.js');

const loadDictionary = async (collection, path) => {
  const fs = require('fs'),
    iconvLite = require('iconv-lite');

  const batch = collection.initializeUnorderedBulkOp();

  const content = fs.readFileSync(path);
  const lines = iconvLite.decode(content, "EUC-JP").toString().split("\n");
  lines.forEach((line) => {
    if(/^;;.+$/.test(line) == false) {
      const regex = /^(\S+)\s\/([^\/].+)\//;
      const matchResult = line.match(regex);

      if(matchResult) {
        const yomi = matchResult[1];
        const candidates = matchResult[2].split('/');
        const entry = {
          'yomi': yomi,
          'candidates': candidates
        };
        batch.insert(entry);
      }
    }
  });
  return batch.execute();
};

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

const main = async () => {
  console.log(`connecting ${uri}`);

  // mongoose接続
  await mongoose.connect(uri);

  // MongoClient接続
  const client = await MongoClient.connect(uri);
  const db = client.db();
  const collection = db.collection('entries');

  // データを消去
  await Entry.deleteMany({});
  console.log('Entry removed');

  // 辞書を順次読み込み
  for (const path of dictionaryFiles) {
    console.log(`loading ${path}`);
    await loadDictionary(collection, path);
  }

  console.log('load finished');

  await client.close();
  await mongoose.connection.close();
  console.log('Connection closed');
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose disconnected through app termination');
  process.exit(0);
});
