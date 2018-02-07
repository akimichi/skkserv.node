'use strict';
// models/entry.js

const mongoose     = require('mongoose'),
  Schema       = mongoose.Schema;
const expect = require('expect.js');

const Pair = require('kansuu.js').pair,
  Either = require('kansuu.js').either,
  List = require('kansuu.js').monad.list;

const Parser = require('../lib/lisp/parser.js'),
  Interpreter = require('../lib/lisp/interpreter.js'),
  Env = require('../lib/lisp/env.js'),
  preludeEnv = Env.prelude(Env.empty);

const EntrySchema   = new Schema({
  yomi: {type: String, unique: true, required: true},
  candidates: Array,
  createdOn: {type: Date, default: Date.now, required: true}
});

// Entry#henkan
// 読みをもとに候補を返す。
// henkan:: String -> [String] | String
EntrySchema.statics.henkan = function (yomi, callback) {
  this.findOne({ 'yomi': yomi }, function (err, entry) {
    if (err) {
      callback(err);
    } else if (entry) {
      callback(null, entry.candidates);
    } else {
      callback(yomi);
    }
    // if (err) {
    //   callback(err);
    // } else if (entry) {
    //   const candidates = entry.candidates.join("/");
    //   callback(null, `1/${candidates}/\n`);
    // } else {
    //   callback(`4${yomi}`);
    // }
  });
}

// Entry#runLisp
// 読みをもとにlisp評価器を実行する
EntrySchema.statics.runLisp = function (yomi, callback) {
  Either.match(Interpreter.run(yomi)(preludeEnv),{
    right: (value) => {
      callback(null, value);
    },
    left: (message) => {
      callback(message);
    },
  });
  // Either.match(Interpreter.run(yomi)(preludeEnv),{
  //   right: (value) => {
  //     callback(null, `1/${value};${yomi}/\n`);
  //   },
  //   left: (value) => {
  //     callback(`4${value}`);
  //   },
  // });
    
  // yomi は (function arg...) の形式をしている。
  // 一方で、辞書には (function)の読みで登録されている。
  // this.findOne({ 'yomi': `(${yomi})` }, function (err, entry) {
  //   if (err) {
  //     callback(err);
  //   } else if (entry) {
  //     const lambda = entry.candidate[0],
  //       closure = Parser.parse();
  //     callback(null, `1/${candidates}/\n`);
  //   } else {
  //     callback(null, `4${yomi} `);
  //   }
  // });
}

module.exports = mongoose.model('Entry', EntrySchema);

