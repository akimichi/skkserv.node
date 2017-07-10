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

// const factories = require("../test/factories.js"),
//     entries = factories.entries();

// roles.doctor.save()
//   .then((savedDoctor) => {
//     console.log('doctor role saved');
//     return roles.nurse.save()
//   })
//   .then((savedNurse) => {
//     console.log('nurse role saved');
//     return roles.clerk.save()
//   })
//   .then((savedClerk) => {
//     console.log('clerk role saved');
//     return roles.admin.save()
//   })
//   .then((savedAdmin) => {
//     console.log('admin role saved');
//     return users.doctor.save()
//   })
//   .then((savedDoctor) => {
//     console.log('doctor user saved');
//     return users.nurse.save()
//   })
//   .then((savedNurse) => {
//     console.log('nurse user saved');
//     return users.clerk.save()
//   })
//   .then((savedClerk) => {
//     console.log('clerk user saved');
//     return users.admin.save()
//   })
//   .then((savedAdmin) => {
//     console.log('admin user saved');
//     return patients.socrates.save()
//   })
//   .then((savedSocrates) => {
//     console.log('socrates patient saved');
//     return patients.plato.save()
//   })
//   .then((savedPlato) => {
//     console.log('plato patient saved');
//     return posts.greeting.save()
//   })
//   .then((savedGreeting) => {
//     console.log('post greeting saved');
//     return posts.hello.save()
//   })
//   .then((savedHello) => {
//     const BYOMEI = require("../lib/byomei.js");
//     return BYOMEI.load('./resource/byomei/byomei401/main/nmain401.txt')
//   })
//   .then((done) => {
//     console.log('all saved');
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.log(error);
//     mongoose.disconnect();
//   });



process.on('SIGINT', () =>  {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});


