'use strict';

// Usage:
// 
// $ NODE_ENV=development node bin/seed.js
// $ NODE_ENV=test node bin/seed.js
// 

const env = process.env.NODE_ENV,
 config = require('../lib/config.js')(env);
const uri = config.db.mongo.uri;

const loadDictionary = require('../lib/loadDictionary.js');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const options = { 
  useMongoClient: true,
  promiseLibrary: require('bluebird') 
};
const DB = mongoose.connect(
  uri,
  options
);

const Entry = require('../models/entry.js');

// あらかじめデータを消去しておく
Entry.remove({},(err) => {
  if(err) {
    throw new Error(err)
  }
  console.log('Entry removed');
})

const callback = (line) => {
  if(/^;;.+$/.test(line) == false) {
    // console.log(line) 
    const regex = /^(\S+)\s\/([^\/].+)\//; 
    const matchResult = line.match(regex);   
    if(matchResult) {
      const yomi = matchResult[1];
      // console.log(matchResult[2])
      const candidates = matchResult[2].split('/');
      // console.log(candidates)
      const entry = new Entry({
        yomi: yomi,
        candidates: candidates 
      });

      entry.save()
        .then((savedEntry) => {
        })
        .catch((error) => {
          console.log(error);
          mongoose.disconnect();
        });
    }
  }
};

loadDictionary.load('./resource/SKK-JISYO.L', callback);


process.on('SIGINT', () =>  {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});


