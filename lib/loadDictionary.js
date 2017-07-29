"use strict;"

const fs = require('fs'),
  readline = require('readline'),
  iconvLite = require('iconv-lite');
const MongoClient = require('mongodb').MongoClient;
const env = process.env.NODE_ENV,
 config = require('../lib/config.js')(env);
const uri = config.db.mongo.uri;



module.exports = {
  load: (path, callback) => {
    MongoClient.connect(uri, (err, db) => {
      if (err) return console.error(err);

      const collection = db.collection('entries');
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

      batch.execute((err, result) =>{
        db.close();
        if (err) console.log(err);
        process.exit();
      });
    });

    // const inputFileStream = fs.createReadStream(path).pipe(iconvLite.decodeStream("EUC-JP"));
    // const rl = readline.createInterface({
    //   input: inputFileStream,
    //   output: process.stdout
    // });

    // rl.on('line', (line) => {
    //   const entry =  callback(line);
    //   if(entry) {
    //     entries.push();
    //   }
    //   // callback(line);
    // });
    // rl.on('close', () => {
    //   console.log('entries length:' + entries.length);
    //   Entry.collection.insert(entries, (err, docs) => {
    //     // inputFileStream.close();
    //     console.log('closed');
    //   });
    // });    
  }
};
