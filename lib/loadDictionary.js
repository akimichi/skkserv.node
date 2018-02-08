"use strict;"

const fs = require('fs'),
  readline = require('readline'),
  iconvLite = require('iconv-lite');

module.exports = {
  load: (collection, path, callback) => {
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
          // batch.find({yomi: yomi}).upsert().update({$addToSet: {candidates: candidates}});
        }
      }
    });
    batch.execute(callback);
  }
};
