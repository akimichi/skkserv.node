"use strict";

const exp = require('./exp.js'),
  Parser = require('./parser.js'),
  ID = require('kansuu.js').monad.identity,
  List = require('kansuu.js').monad.list,
  Pair = require('kansuu.js').pair,
  Either = require('kansuu.js').monad.either;


/* 空の環境を作る */
/* empty:: STRING => VALUE */
const empty = (name) => {
  return Either.left(`変数 ${name} は、未定義です`);
  // return Either.left(undefined);
};
/* 変数名に対応する値を環境から取り出す */
/* lookup:: (STRING, ENV) => VALUE */
const lookup = (name, environment) => {
  return environment(name);
};
/* 環境を拡張する */
/* extend:: (STRING, VALUE) => ENV => (STRING => VALUE) */
const extend = (identifier, value) => (environment) => (queryIdentifier) => {
  if(identifier === queryIdentifier) {
    return Either.right(value);
    // return value;
  } else {
    return lookup(queryIdentifier,environment);
  }
};

const prelude = (environment) => {
  return extend("succ", ((x) =>  { return x + 1  }))(environment);
  // return extend("+", 
  //   Pair.match(List.head(Parser.parse(Parser.lambda)(List.fromString("(lambda (x) (lambda (y) (+ x y)))"))),{
  //     cons: (left, right) => {
  //       return left;
  //     }
  //   })
  // )(environment);
  // return (y) => {
  //   return x + y;
  // };
};

module.exports = {
  /* 空の環境を作る */
  empty: empty,
  /* 変数名に対応する値を環境から取り出す */
  lookup : lookup, 
  /* 環境を拡張する */
  extend: extend,
  /* prelude環境を作る */
  prelude: prelude 
};
