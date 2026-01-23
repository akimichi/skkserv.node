'use strict';

const mongoose = require('mongoose');
const env = process.env.NODE_ENV || 'test',
  config = require('../lib/config.js')(env),
  uri = config.db.mongo.uri;

console.log(config)

before(async function () {
  this.timeout('15s');

  const clearDB = async () => {
    for (const name in mongoose.connection.collections) {
      await mongoose.connection.collections[name].deleteMany({});
    }
  };

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
  }
  await clearDB();
});


after(async () => {
  await mongoose.disconnect();
});
