"use strict";

const expect = require('expect.js'),
  env = require('../../lib/lisp/env.js'),
  Pair = require('kansuu.js').pair,
  Either = require('kansuu.js').either,
  List = require('kansuu.js').monad.list,
  Parser = require('../../lib/lisp/parser.js');

const Env = require('../../lib/lisp/interpret.js').env,
  Exp = require('../../lib/lisp/interpret.js').exp,
  Parser = require('../../lib/lisp/interpret.js').parser,
  Evalator = require('../../lib/lisp/interpret.js').evaluator;

describe('インタープリター', () => {
  it('数値の評価のテスト', (next) => {
    const numericParser = Parser.numeric();
    Either.match(interpret(numericParser)("123")(env.empty), {
      left: (value) => {
        expect().fail();
      },
      right: (value) => {
        expect(value).to.eql(123)
      }
    });
    next();
  });
});

// const interpret = require('../../lib/lisp/interpreter.js');

// describe('インタープリター', () => {
//   it('数値の評価のテスト', (next) => {
//     const numericParser = Parser.numeric();
//     Either.match(interpret(numericParser)("123")(env.empty), {
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
