'use strict';

const dictionary = require('../lib/dictionary.js');

before(async function () {
  this.timeout('15s');
  dictionary.clear();
});

after(async () => {
  // 特に何もしない
});
