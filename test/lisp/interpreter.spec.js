"use strict";

const expect = require('expect.js'),
  Env = require('../../lib/lisp/env.js'),
  Pair = require('kansuu.js').pair,
  Either = require('kansuu.js').either,
  List = require('kansuu.js').monad.list,
  Exp = require('../../lib/lisp/exp.js'),
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
  describe('listの評価', () => {
    it('リスト評価のテスト', function(next) {
      this.timeout('5s');
      Either.match(Interpreter.run("'(1 2 3)")(emptyEnv),{
        right: (list) => {
           List.match(list, {
             cons: (head, tail) => {
               Exp.match(head, {
                 atom: (value) => {
                   expect(value).to.eql(1)
                 }
               })
             }
           });
        },
        left: (value) => {
          expect().fail()
        },
      });
      Either.match(Interpreter.run("'(\"a\" \"b\")")(emptyEnv),{
        right: (list) => {
           List.match(list, {
             cons: (head, tail) => {
               Exp.match(head, {
                 atom: (value) => {
                   expect(value).to.eql("a")
                 }
               })
             }
           });
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
  describe('条件式の評価', () => {
    it('ifExpr評価のテスト', (next) => {
      Either.match(Interpreter.run("(if #t 1 2)")(emptyEnv),{
        right: (value) => {
          expect(value).to.eql(1)
        },
        left: (value) => {
          expect().fail()
        },
      });
      next();
    });
  });
  describe('演算子の評価', () => {
    const preludeEnv = Env.prelude(Env.empty);
    it('論理演算子の評価', function(next) {
      this.timeout('5s');
      Either.match(Interpreter.run("(not #t)")(preludeEnv),{
        right: (value) => {
          expect(value).to.eql(false)
        },
        left: (value) => {
          expect().fail()
        },
      });
      Either.match(Interpreter.run("(and #f #f)")(preludeEnv),{
        right: (value) => {
          expect(value).to.eql(false)
        },
        left: (value) => {
          expect().fail()
        },
      });
      Either.match(Interpreter.run("(and (or #f #f) (not #f))")(preludeEnv),{
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
  describe('関数適用の評価', () => {
    const preludeEnv = Env.prelude(Env.empty);

    it('1項関数のsuccの評価が成功する', (next) => {
      Either.match(Interpreter.run("(succ 0)")(preludeEnv),{
        right: (value) => {
          expect(value).to.eql(1)
        },
        left: (value) => {
          expect().fail()
        },
      });
      next();
    });
    it('2項関数である+の評価が成功する', function(next) {
      this.timeout('5s');
      Either.match(Interpreter.run("(+ 10 20)")(preludeEnv),{
        right: (value) => {
          expect(value).to.eql(30)
        },
        left: (value) => {
          expect().fail()
        },
      });
      Either.match(Interpreter.run("(BMI 70 1.75)")(preludeEnv),{
        right: (value) => {
          expect(value).to.be.within(22, 23);
        },
        left: (value) => {
          expect().fail()
        },
      });
      next();
    });
  });
});


