import dictionary = require('../lib/dictionary');

before(async function () {
  this.timeout('15s');
  dictionary.clear();
});

after(async () => {
  // 特に何もしない
});
