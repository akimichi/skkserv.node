"use strict";

const expect = require('expect.js'),
  Env = require('../../lib/lisp/env.js'),
  Pair = require('kansuu.js').pair,
  Either = require('kansuu.js').either,
  List = require('kansuu.js').monad.list,
  Parser = require('../../lib/lisp/parser.js'),
  Interpreter = require('../../lib/lisp/interpreter.js');

// const Env = require('../../lib/lisp/interpreter.js').env,
//   Exp = require('../../lib/lisp/interpreter.js').exp,
//   // Parser = require('../../lib/lisp/interpret.js').parser,
//   Evalator = require('../../lib/lisp/interpreter.js').evaluator;

// describe('インタープリター', () => {
//   it('数値の評価のテスト', (next) => {
//     const numericParser = Parser.numeric;
//     Either.match(Evalator(numericParser)("123")(env.empty), {
//       left: (value) => {
//         expect().fail();
//       },
//       right: (value) => {
//         expect(value).to.eql(123)
//       }
//     });
//     next();
//   });
// });

describe('インタープリター', () => {
  const emptyEnv = Env.empty;
  it('数値の評価のテスト', (next) => {
    Either.match(Interpreter.run("100")(emptyEnv),{
      right: (value) => {
        expect(value).to.eql(100)
      },
      left: (value) => {
        expect().fail()
      },
    });
    Either.match(Interpreter.run("-0.01")(emptyEnv),{
      right: (value) => {
        expect(value).to.eql(-0.01)
      },
      left: (value) => {
        expect().fail()
      },
    });
    next();
  });
});


