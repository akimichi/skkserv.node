"use strict;"

const fs = require('fs'),
  readline = require('readline'),
  iconvLite = require('iconv-lite');
const MongoClient = require('mongodb').MongoClient;
const env = process.env.NODE_ENV,
 config = require('../lib/config.js')(env);
const uri = config.db.mongo.uri;


const Entry = require('../models/entry.js');

module.exports = {
  load: (path) => {
    MongoClient.connect(uri, (err, db) => {
      console.log(`connecting ${uri} with ${path} `)
      if (err) return console.error(err);

      const collection = db.collection('entries');
      // const batch = collection.initializeOrderedBulkOp();
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
            batch.find({yomi: yomi}).upsert().update({$addToSet: {candidates: candidates}});
          }
          // if(matchResult) {
          //   const yomi = matchResult[1];
          //   const candidates = matchResult[2].split('/');
          //   Entry.update({yomi: yomi}, {$addToSet: candidates}, {upsert:true}, function(err, doc){
          //       if(err) {
          //       } else  {
          //       }
          //   });
          //   // Entry.findOneAndUpdate({yomi: yomi}, newData, {upsert:true}, function(err, doc){
          //   // });
          //   // const entry = {
          //   //   'yomi': yomi,
          //   //   'candidates': candidates
          //   // };
          //   batch.insert(entry);
          // }
        }
      });

      batch.execute((err, result) =>{
        console.log(`batch executed with ${path}`)
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
