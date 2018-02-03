'use strict';
// models/entry.js

const mongoose     = require('mongoose'),
  Schema       = mongoose.Schema;

const Interpreter = require('../lib/lisp/interpreter.js'),
  Env = require('../lib/lisp/env.js'),
  preludeEnv = Env.prelude(Env.empty);

const EntrySchema   = new Schema({
  yomi: {type: String, unique: true, required: true},
  candidates: Array,
  createdOn: {type: Date, default: Date.now, required: true}
});

// Entry#henkan
// 読みをもとに候補を返す。
EntrySchema.statics.henkan = function (yomi, callback) {
  this.findOne({ 'yomi': yomi }, function (err, entry) {
    if (err) {
      callback(err);
    } else if (entry) {
      const candidates = entry.candidates.join("/");
      callback(null, `1/${candidates}/\n`);
    } else {
      callback(null, `4${yomi} `);
    }
  });
}

// Entry#jikko
// 読みをもとにlisp評価器を実行する
EntrySchema.statics.runLisp = function (yomi, callback) {
  // yomi は (function arg...) の形式をしている。
  // 一方で、辞書には (function)の読みで登録されている。
  this.findOne({ 'yomi': yomi }, function (err, entry) {
    if (err) {
      callback(err);
    } else if (entry) {
      const candidates = entry.candidates.join("/");
      callback(null, `1/${candidates}/\n`);
    } else {
      callback(null, `4${yomi} `);
    }
  });
}

module.exports = mongoose.model('Entry', EntrySchema);

