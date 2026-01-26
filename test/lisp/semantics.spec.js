'use strict';

const expect = require('expect.js'),
  Exp = require('../../lib/lisp/exp.js'),
  Env = require('../../lib/lisp/env.js'),
  List = require('kansuu.js').monad.list,
  Either = require('kansuu.js').monad.either;
  // M = require('kansuu.js').monad.identity;
const evaluate = require('../../lib/lisp/semantics.js');

describe('式の評価', () => {
  describe('リストの評価', () => {
    it('listの評価', (next) => {
      Either.match(evaluate(Exp.list(List.unit(1)), Env.empty),{
        right: (items) => {
           List.match(items, {
             cons: (head, tail) => {
               expect(head).to.eql(1)
               next();
             }
           });
        }
      });
    });
    it('consを評価してリストを返す', (next) => {
      Either.match(evaluate(Exp.cons(Exp.atom("a"), Exp.nil()), Env.empty),{
        right: (items) => {
           List.match(items, {
             cons: (head, tail) => {
               expect(head).to.eql("a")
             }
           });
        }
      });
      next();
    });
  });
  describe('atomの評価', () => {
    it('数値の評価のテスト', (next) => {
      Either.match(evaluate(Exp.atom(2), Env.empty),{
        right: (value) => {
           expect(value).to.eql(2)
        }
      });
      // expect(
      //   evaluate(Exp.atom(2), Env.empty)
      // ).to.eql(
      //   M.unit(2)
      // );
      next();
    });
    it('ブール値の評価のテスト', (next) => {
      Either.match(evaluate(Exp.atom(true), Env.empty),{
        right: (value) => {
           expect(value).to.eql(true)
        }
      });
      // expect(
      //   evaluate(Exp.atom(true), Env.empty)
      // ).to.eql(
      //   M.unit(true)
      // );
      next();
    });
    it('文字列の評価のテスト', (next) => {
      Either.match(evaluate(Exp.atom("これは文字列です"), Env.empty),{
        right: (value) => {
           expect(value).to.eql("これは文字列です")
        }
      });
      // expect(
      //   evaluate(Exp.atom("これは文字列です"), Env.empty)
      // ).to.eql(
      //   M.unit("これは文字列です")
      // );
      next();
    });
  });
  describe('変数評価のテスト', () => {
    it('環境から変数の値を取り出すテスト', (next) => {
      const emptyEnv = Env.empty,
      initEnv = Env.extend('a', 1)(emptyEnv);
      Either.match(evaluate(Exp.variable("a"), initEnv),{
        right: (value) => {
           expect(value).to.eql(1)
        }
      });
      Either.match(evaluate(Exp.variable("a"), initEnv),{
        right: (value) => {
           expect(value).to.eql(1)
        }
      });
      // expect(
      //     evaluate(Exp.variable("a"), initEnv)
      //     ).to.eql(
      //       M.unit(1)
      //       );
      next();
    });
    it('存在しない変数は、評価されると undefined となる', (next) => {
      const emptyEnv = Env.empty,
        initEnv = Env.extend('a', 1)(emptyEnv);
      Either.match(evaluate(Exp.variable("b"), initEnv),{
        right: (value) => {
          expect().to.fail()
        },
        left: (message) => {
          expect(message).to.eql("変数 b は、未定義です")
        }
      });
      // expect(
      //   evaluate(Exp.variable("b"), initEnv)
      // ).to.eql(
      //   M.unit(undefined)
      // );
      next();
    });
  });
  describe('ブール演算のテスト', () => {
    it('andのテスト', (next) => {
      Either.match(evaluate(Exp.and(Exp.atom(true),Exp.atom(true)), Env.emptyEnv),{
        right: (value) => {
          expect(value).to.eql(true)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('orのテスト', (next) => {
      Either.match(evaluate(Exp.or(Exp.atom(false),Exp.atom(false)), Env.emptyEnv),{
        right: (value) => {
          expect(value).to.eql(false)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('notのテスト', (next) => {
      Either.match(evaluate(Exp.not(Exp.atom(false)), Env.emptyEnv),{
        right: (value) => {
          expect(value).to.eql(true)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
  });
  describe('数値演算のテスト', () => {
    it('addのテスト', (next) => {
      // Either.match(evaluate(Exp.add(Exp.num(0),Exp.num(1)), Env.emptyEnv),{
      Either.match(evaluate(Exp.add(Exp.atom(0),Exp.atom(1)), Env.emptyEnv),{
        right: (value) => {
          expect(value).to.eql(1)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('subtractのテスト', (next) => {
      Either.match(evaluate(Exp.subtract(Exp.atom(5), Exp.atom(3)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(2)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('subtractで負の結果', (next) => {
      Either.match(evaluate(Exp.subtract(Exp.atom(3), Exp.atom(5)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(-2)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('multiplyのテスト', (next) => {
      Either.match(evaluate(Exp.multiply(Exp.atom(3), Exp.atom(4)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(12)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('multiplyでゼロ', (next) => {
      Either.match(evaluate(Exp.multiply(Exp.atom(0), Exp.atom(100)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(0)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('divideのテスト', (next) => {
      Either.match(evaluate(Exp.divide(Exp.atom(10), Exp.atom(2)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(5)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('divideで浮動小数点結果', (next) => {
      Either.match(evaluate(Exp.divide(Exp.atom(7), Exp.atom(2)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(3.5)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('divideでゼロ除算', (next) => {
      Either.match(evaluate(Exp.divide(Exp.atom(1), Exp.atom(0)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(Infinity)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('exptのテスト', (next) => {
      Either.match(evaluate(Exp.expt(Exp.atom(2), Exp.atom(3)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(8)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('exptでゼロ乗', (next) => {
      Either.match(evaluate(Exp.expt(Exp.atom(5), Exp.atom(0)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(1)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
  });
  describe('関数適用のテスト', () => {
    it('id(1)のテスト', (next) => {
      const x = Exp.variable("x"),
        id = Exp.lambda(x, x);
      // Either.match(evaluate(Exp.app(id,Exp.num(1)), Env.emptyEnv),{
      Either.match(evaluate(Exp.app(id,Exp.atom(1)), Env.emptyEnv),{
        right: (value) => {
          expect(value).to.eql(1)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('(succ 2)のテスト', (next) => {
      const x = Exp.variable("x"),
        y = Exp.variable("y"),
        succ = Exp.lambda(x, Exp.succ(x));
      Either.match(evaluate(Exp.app(succ, Exp.atom(2)), Env.emptyEnv),{
        right: (value) => {
          expect(value).to.eql(3)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('(+ 1 2)のテスト', (next) => {
      const x = Exp.variable("x"),
        y = Exp.variable("y"),
        plus = Exp.lambda(x, Exp.lambda(y, Exp.add(x,y)));
        // plus = Exp.lambda(x, Exp.lambda(y, Exp.add(x,y)));
        // (\x -> (\y -> x + y))(1)(2)
      Either.match(evaluate(Exp.app(Exp.app(plus,Exp.atom(1)), Exp.atom(2)), Env.emptyEnv),{
        right: (value) => {
          expect(value).to.eql(3)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
  });
  describe("prelude環境を使った", () => {
    it('(succ 2) のテスト', function(next) {
      this.timeout('5s');
      const succ = Exp.variable("succ");
      Either.match(evaluate(Exp.app(succ, Exp.atom(2)), Env.prelude(Env.emptyEnv)),{
        right: (value) => {
          expect(value).to.eql(3)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('(+ 1 2) のテスト', function(next) {
      this.timeout('5s');
      const plus = Exp.variable("+");
      const expression = Exp.app(
        Exp.app(plus, Exp.atom(1)), 
        Exp.atom(2)
      );
      Either.match(evaluate(expression, Env.prelude(Env.emptyEnv)),{
        right: (value) => {
          expect(value).to.eql(3)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    // it('(today) のテスト', (next) => {
    //   const today = Exp.variable("today!");
    //   const _ = Exp.variable("_");
    //   Either.match(evaluate(Exp.app(today, _), Env.prelude(Env.emptyEnv)),{
    //     right: (value) => {
    //       expect(value).to.eql(3)
    //     },
    //     left: (value) => {
    //       expect().to.fail()
    //     }
    //   });
    //   next();
    // });
  });
  it('if式の評価のテスト', (next) => {
    Either.match(evaluate(Exp.ifExpr(Exp.atom(true), Exp.atom(1), Exp.atom(0)), Env.empty),{
      right: (value) => {
        expect(value).to.eql(1)
      }
    });
    Either.match(evaluate(Exp.ifExpr(Exp.atom(false), Exp.atom(1), Exp.atom(0)), Env.empty),{
      right: (value) => {
        expect(value).to.eql(0)
      }
    });
    next();
  });
  describe('isEqualのテスト', () => {
    it('数値が等しい場合', (next) => {
      Either.match(evaluate(Exp.isEqual(Exp.atom(1), Exp.atom(1)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(true)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('数値が等しくない場合', (next) => {
      Either.match(evaluate(Exp.isEqual(Exp.atom(1), Exp.atom(2)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(false)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('文字列が等しい場合', (next) => {
      Either.match(evaluate(Exp.isEqual(Exp.atom("abc"), Exp.atom("abc")), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(true)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('ブール値の比較', (next) => {
      Either.match(evaluate(Exp.isEqual(Exp.atom(true), Exp.atom(false)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.eql(false)
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
  });
  describe('日時関数のテスト', () => {
    it('today_のテスト', function(next) {
      this.timeout('5s');
      Either.match(evaluate(Exp.today_(Exp.atom(undefined)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.be.an('array');
          expect(value.length).to.eql(2);
          // ISO形式: YYYY-MM-DD
          expect(value[0]).to.match(/^\d{4}-\d{2}-\d{2}$/);
          // 日本形式: YYYY年MM月DD日
          expect(value[1]).to.match(/^\d{4}年\d{2}月\d{2}日$/);
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
    it('now_のテスト', function(next) {
      this.timeout('5s');
      Either.match(evaluate(Exp.now_(Exp.atom(undefined)), Env.emptyEnv), {
        right: (value) => {
          expect(value).to.be.a('string');
          expect(value.length).to.be.greaterThan(0);
        },
        left: (value) => {
          expect().to.fail()
        }
      });
      next();
    });
  });
});
