"use strict";

const Exp = require('./exp.js'),
  Parser = require('./parser.js'),
  ID = require('kansuu.js').monad.identity,
  List = require('kansuu.js').monad.list,
  Pair = require('kansuu.js').pair,
  Either = require('kansuu.js').monad.either;

const expect = require("expect.js");

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
  expect(identifier).to.a("string");
  if(identifier === queryIdentifier) {
    return Either.right(value);
    // return value;
  } else {
    return lookup(queryIdentifier,environment);
  }
};

const prelude = (environment) => {
  const x = Exp.variable("x"),
    y = Exp.variable("y"),
    _ = Exp.variable("_");
  const builtinFunctions = List.fromVector([
    Pair.cons("_",Exp.atom(undefined)),
    Pair.cons("succ",Exp.lambda(x, Exp.succ(x))),
    Pair.cons("+",Exp.lambda(x, Exp.lambda(y, Exp.add(x,y)))),
    Pair.cons("-", Exp.lambda(x, Exp.lambda(y, Exp.subtract(x,y)))),
    Pair.cons("today!",Exp.lambda(_, Exp.today_(_)))
  ]);
  return List.foldl(builtinFunctions)(environment)(pair => accumulator => {
    return Pair.match(pair, {
      cons: (left, right) => {
        return extend(left, right)(accumulator);
      }
    });
  })
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
