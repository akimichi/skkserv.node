"use strict;"

const fs = require('fs'),
  readline = require('readline'),
  iconvLite = require('iconv-lite');


module.exports = {
  load: (path, callback) => {
    const inputFileStream = fs.createReadStream(path).pipe(iconvLite.decodeStream("EUC-JP"));
    const rl = readline.createInterface({
      input: inputFileStream,
      output: process.stdout
    });

    rl.on('line', (line) => {
      callback(line);
    });
    rl.on('close', () => {
      inputFileStream.close();
      console.log('closed');
    });    
    // fs.readFile(path, (err, content) => {
    //   if(err) {
    //     throw err;
    //   }
    //   callback(content);
    // });
  }
};
