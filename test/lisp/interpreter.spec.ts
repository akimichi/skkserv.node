import expect = require('expect.js');
import Env = require('../../lib/lisp/env');
const Pair = require('kansuu.js').pair;
const Either = require('kansuu.js').either;
const List = require('kansuu.js').monad.list;
import Exp = require('../../lib/lisp/exp');
import Interpreter = require('../../lib/lisp/interpreter');

describe('インタープリター', () => {
  const emptyEnv = Env.empty;
  describe('compile', () => {
    describe('atomの評価', () => {
      it('数値の評価のテスト', (next) => {
        Exp.match(Interpreter.compile("100"), {
          atom: (value: any) => {
            expect(value).to.eql(100)
          }
        });
        next();
      });
    });
    describe('lambdaの評価', () => {
      it('succの評価のテスト', (next) => {
        Exp.match(Interpreter.compile("(lambda (n) (succ n))"), {
          lambda: (arg: any, body: any) => {
            Exp.match(arg, {
              variable: (name: any) => {
                expect(name).to.eql('n');
              }
            })
          }
        });
        next();
      });
    });
  });
  describe('run', () => {
    describe('atomの評価', () => {
      it('数値の評価のテスト', (next) => {
        Either.match(Interpreter.run("100")(emptyEnv), {
          right: (value: any) => {
            expect(value).to.eql(100)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        Either.match(Interpreter.run("-0.01")(emptyEnv), {
          right: (value: any) => {
            expect(value).to.eql(-0.01)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
      it('ブールの評価のテスト', (next) => {
        Either.match(Interpreter.run("#t")(emptyEnv), {
          right: (value: any) => {
            expect(value).to.eql(true)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        Either.match(Interpreter.run("#f")(emptyEnv), {
          right: (value: any) => {
            expect(value).to.eql(false)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
    });
    describe('listの評価', () => {
      it('リスト評価のテスト', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("'(1 2 3)")(emptyEnv), {
          right: (list: any) => {
            List.match(list, {
              cons: (head: any, tail: any) => {
                Exp.match(head, {
                  atom: (value: any) => {
                    expect(value).to.eql(1)
                  }
                })
              }
            });
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        Either.match(Interpreter.run("'(\"a\" \"b\")")(emptyEnv), {
          right: (list: any) => {
            List.match(list, {
              cons: (head: any, tail: any) => {
                Exp.match(head, {
                  atom: (value: any) => {
                    expect(value).to.eql("a")
                  }
                })
              }
            });
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
    });
    describe('変数の評価', () => {
      const initEnv = Env.extend("a", 0)(Env.empty);
      it('変数の評価が成功する', (next) => {
        Either.match(Interpreter.run("a")(initEnv), {
          right: (value: any) => {
            expect(value).to.eql(0)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
      it('変数の評価が失敗する', (next) => {
        Either.match(Interpreter.run("b")(initEnv), {
          right: (value: any) => {
            expect().fail()
          },
          left: (value: any) => {
            expect(value).to.eql("変数 b は、未定義です")
          },
        });
        next();
      });
    });
    describe('条件式の評価', () => {
      it('ifExpr評価のテスト', (next) => {
        Either.match(Interpreter.run("(if #t 1 2)")(emptyEnv), {
          right: (value: any) => {
            expect(value).to.eql(1)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
    });
    describe('演算子の評価', () => {
      const preludeEnv = Env.prelude(Env.empty);
      it('論理演算子の評価', function (next) {
        this.timeout('8s');
        Either.match(Interpreter.run("(not #t)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.eql(false)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        Either.match(Interpreter.run("(and #f #f)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.eql(false)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        Either.match(Interpreter.run("(and (or #f #f) (not #f))")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.eql(false)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
    });
    describe('算術演算子の評価', () => {
      const preludeEnv = Env.prelude(Env.empty);
      it('expt', (next) => {
        Either.match(Interpreter.run("(expt 2 3)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.eql(8)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
      it('引き算の評価', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(- 10 3)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.eql(7)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
      it('掛け算の評価', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(* 4 5)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.eql(20)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
      it('割り算の評価', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(/ 20 4)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.eql(5)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
      it('ネストした算術演算', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(+ (* 2 3) (/ 10 2))")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.eql(11)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
      it('CaloricNeedsの評価', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(CaloricNeeds 1.7)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.be.within(1589, 1590)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
    });
    describe('日時関数の評価', () => {
      const preludeEnv = Env.prelude(Env.empty);
      it('today!の評価', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(today!)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.be.an('array');
            expect(value.length).to.eql(2);
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
      it('now!の評価', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(now!)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.be.a('string');
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
    });
    describe('関数適用の評価', () => {
      const preludeEnv = Env.prelude(Env.empty);

      it('1項関数のsuccの評価が成功する', (next) => {
        Either.match(Interpreter.run("(succ 0)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.eql(1)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
      it('2項関数の評価が成功する', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(+ 10 20)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.eql(30)
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        Either.match(Interpreter.run("(BMI 70 1.75)")(preludeEnv), {
          right: (value: any) => {
            expect(value).to.be.within(22, 23);
          },
          left: (value: any) => {
            expect().fail()
          },
        });
        next();
      });
    });
  });
});
