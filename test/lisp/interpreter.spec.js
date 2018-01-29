"use strict";

const expect = require('expect.js'),
  Env = require('../../lib/lisp/env.js'),
  Pair = require('kansuu.js').pair,
  Either = require('kansuu.js').either,
  List = require('kansuu.js').monad.list,
  Parser = require('../../lib/lisp/parser.js'),
  Interpreter = require('../../lib/lisp/interpreter.js');

describe('インタープリター', () => {
  const emptyEnv = Env.empty;
  describe('atomの評価', () => {
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
    it('ブールの評価のテスト', (next) => {
      Either.match(Interpreter.run("#t")(emptyEnv),{
        right: (value) => {
          expect(value).to.eql(true)
        },
        left: (value) => {
          expect().fail()
        },
      });
      Either.match(Interpreter.run("#f")(emptyEnv),{
        right: (value) => {
          expect(value).to.eql(false)
        },
        left: (value) => {
          expect().fail()
        },
      });
      next();
    });
  });
  describe('変数の評価', () => {
    const initEnv = Env.extend("a",0)(Env.empty);
    it('変数の評価が成功する', (next) => {
      Either.match(Interpreter.run("a")(initEnv),{
        right: (value) => {
          expect(value).to.eql(0)
        },
        left: (value) => {
          expect().fail()
        },
      });
      next();
    });
    it('変数の評価が失敗する', (next) => {
      Either.match(Interpreter.run("b")(initEnv),{
        right: (value) => {
          expect().fail()
        },
        left: (value) => {
          expect(value).to.eql("変数 b は、未定義です")
        },
      });
      next();
    });
  });
});


