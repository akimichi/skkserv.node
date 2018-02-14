"use strict";

const Exp = require('./exp.js'),
  List = require('kansuu.js').monad.list,
  Pair = require('kansuu.js').pair,
  Either = require('kansuu.js').monad.either;

const expect = require("expect.js");

const Self = {
  /* 空の環境を作る */
  /* empty:: STRING => VALUE */
  empty: (name) => {
    return Either.left(`変数 ${name} は、未定義です`);
  },
  /* 変数名に対応する値を環境から取り出す */
  /* lookup:: (STRING, ENV) => VALUE */
  lookup: (name, environment) => {
    return environment(name);
  },
  /* 環境を拡張する */
  /* extend:: (STRING, VALUE) => ENV => (STRING => VALUE) */
  extend: (identifier, value) => (environment) => (queryIdentifier) => {
    expect(identifier).to.a("string");
    if(identifier === queryIdentifier) {
      return Either.right(value);
    } else {
      return Self.lookup(queryIdentifier,environment);
    }
  },
  prelude: (environment) => {
    const x = Exp.variable("x"),
      y = Exp.variable("y"),
      head = Exp.variable("head"),
      tail = Exp.variable("tail"),
      _ = Exp.variable("_");
    const builtinFunctions = List.fromVector([
      Pair.cons("_",Exp.atom(undefined)),
      Pair.cons("succ",Exp.lambda(x, Exp.succ(x))),
      Pair.cons("not",Exp.lambda(x, Exp.negate(x))),
      Pair.cons("and",Exp.lambda(x, Exp.lambda(y, Exp.and(x,y)))),
      Pair.cons("or",Exp.lambda(x, Exp.lambda(y, Exp.or(x,y)))),
      Pair.cons("cons",Exp.lambda(head, Exp.lambda(tail, Exp.cons(head,tail)))),
      Pair.cons("+",Exp.lambda(x, Exp.lambda(y, Exp.add(x,y)))),
      Pair.cons("-", Exp.lambda(x, Exp.lambda(y, Exp.subtract(x,y)))),
      Pair.cons("*",Exp.lambda(x, Exp.lambda(y, Exp.multiply(x,y)))),
      Pair.cons("/", Exp.lambda(x, Exp.lambda(y, Exp.divide(x,y)))),
      Pair.cons("today!",Exp.lambda(_, Exp.today_(_))),
      Pair.cons("now!",Exp.lambda(_, Exp.now_(_))),
      // BMI(x,y) = x / (y*y)
      Pair.cons("BMI",Exp.lambda(x, Exp.lambda(y, Exp.divide(x,Exp.multiply(y,y))))),
      // 必要カロリー量 = ( height^2 ) * 22 * 25
      Pair.cons("CaloricNeeds",Exp.lambda(x, Exp.multiply(22, Exp.multiply(25, Exp.multiply(x,x))))),
    ]);
    return List.foldl(builtinFunctions)(environment)(pair => accumulator => {
      return Pair.match(pair, {
        cons: (left, right) => {
          return Self.extend(left, right)(accumulator);
        }
      });
    })
  }
};


module.exports = Self;

