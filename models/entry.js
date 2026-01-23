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
// henkan:: String -> Promise<[String]>
// 見つからない場合はyomiをthrowする
EntrySchema.statics.henkan = async function (yomi) {
  const entry = await this.findOne({ 'yomi': yomi });
  if (entry) {
    return entry.candidates;
  }
  throw yomi;
}

// Entry#runLisp
// 読みをもとにlisp評価器を実行する
// runLisp:: String -> Promise<value>
EntrySchema.statics.runLisp = function (yomi) {
  return new Promise((resolve, reject) => {
    Either.match(Interpreter.run(yomi)(preludeEnv), {
      right: (value) => {
        resolve(value);
      },
      left: (errMessage) => {
        reject(errMessage);
      },
    });
  });
}

module.exports = mongoose.model('Entry', EntrySchema);

