import Exp = require('./exp');
const List = require('kansuu.js').monad.list;
const Pair = require('kansuu.js').pair;
const Either = require('kansuu.js').monad.either;

const expect = require("expect.js");

type Env = (name: string) => any;

const Self = {
  empty: ((name: string) => {
    return Either.left(`変数 ${name} は、未定義です`);
  }) as Env,
  lookup: (name: string, environment: Env): any => {
    return environment(name);
  },
  extend: (identifier: string, value: any) => (environment: Env): Env => (queryIdentifier: string) => {
    expect(identifier).to.a("string");
    if (identifier === queryIdentifier) {
      return Either.right(value);
    } else {
      return Self.lookup(queryIdentifier, environment);
    }
  },
  prelude: (environment: Env): Env => {
    const x = Exp.variable("x"),
      y = Exp.variable("y"),
      head = Exp.variable("head"),
      tail = Exp.variable("tail"),
      _ = Exp.variable("_");
    // 循環依存回避: 動的require
    const Interpreter = require('./interpreter');
    const builtinFunctions = List.fromVector([
      Pair.cons("_", Exp.atom(undefined)),
      Pair.cons("succ", Interpreter.compile('(lambda (n) (+ 1 n))')),
      Pair.cons("not", Exp.lambda(x, Exp.not(x))),
      Pair.cons("and", Exp.lambda(x, Exp.lambda(y, Exp.and(x, y)))),
      Pair.cons("or", Exp.lambda(x, Exp.lambda(y, Exp.or(x, y)))),
      Pair.cons("cons", Exp.lambda(head, Exp.lambda(tail, Exp.cons(head, tail)))),
      Pair.cons("expt", Exp.lambda(x, Exp.lambda(y, Exp.expt(x, y)))),
      Pair.cons("+", Exp.lambda(x, Exp.lambda(y, Exp.add(x, y)))),
      Pair.cons("-", Exp.lambda(x, Exp.lambda(y, Exp.subtract(x, y)))),
      Pair.cons("*", Exp.lambda(x, Exp.lambda(y, Exp.multiply(x, y)))),
      Pair.cons("/", Exp.lambda(x, Exp.lambda(y, Exp.divide(x, y)))),
      Pair.cons("today!", Exp.lambda(_, Exp.today_(_))),
      Pair.cons("now!", Exp.lambda(_, Exp.now_(_))),
      Pair.cons("BMI", Interpreter.compile('(lambda (weight) (lambda (height) (/ weight (* height height))))')),
      Pair.cons("CaloricNeeds", Exp.lambda(x, Exp.multiply(Exp.atom(22), Exp.multiply(Exp.atom(25), Exp.multiply(x, x))))),
    ]);
    return List.foldl(builtinFunctions)(environment)((pair: any) => (accumulator: Env) => {
      return Pair.match(pair, {
        cons: (left: string, right: any) => {
          return Self.extend(left, right)(accumulator);
        }
      });
    })
  }
};

export = Self;
