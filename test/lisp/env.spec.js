'use strict';

const expect = require('expect.js'),
  env = require('../../lib/lisp/env.js'),
  ID = require('kansuu.js').monad.identity,
  Either = require('kansuu.js').monad.either;
const Env = require('../../lib/lisp/env.js'),
  Exp = require('../../lib/lisp/exp.js');

describe('環境のテスト', () => {
  const emptyEnv = Env.empty;
  describe('lookupで値を取り出す', () => {
    it('空の環境から値を取り出す', (next) => {
      Either.match(Env.lookup('dummy', emptyEnv),{
        right: (value) => {
          expect().fail()
        },
        left: (value) => {
          expect(value).to.eql("変数 dummy は、未定義です")
        },
      });
      // expect(
      //   Env.lookup('dummy', emptyEnv)
      // ).to.eql(undefined)
      next();
    });
    it('拡張された環境から値を取り出す', (next) => {
      const initEnv = Env.extend('a', 1)(emptyEnv);
      Either.match(Env.lookup('a', initEnv),{
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
  describe('extendの詳細テスト', () => {
    it('複数変数の連鎖追加', (next) => {
      const env1 = Env.extend('a', 1)(Env.empty);
      const env2 = Env.extend('b', 2)(env1);
      const env3 = Env.extend('c', 3)(env2);

      Either.match(Env.lookup('a', env3), {
        right: (value) => {
          expect(value).to.eql(1)
        },
        left: (value) => {
          expect().fail()
        },
      });
      Either.match(Env.lookup('b', env3), {
        right: (value) => {
          expect(value).to.eql(2)
        },
        left: (value) => {
          expect().fail()
        },
      });
      Either.match(Env.lookup('c', env3), {
        right: (value) => {
          expect(value).to.eql(3)
        },
        left: (value) => {
          expect().fail()
        },
      });
      next();
    });
    it('同名変数の上書き（シャドウイング）', (next) => {
      const env1 = Env.extend('x', 1)(Env.empty);
      const env2 = Env.extend('x', 100)(env1);

      Either.match(Env.lookup('x', env2), {
        right: (value) => {
          expect(value).to.eql(100)
        },
        left: (value) => {
          expect().fail()
        },
      });
      next();
    });
  });
  describe('prelude環境を使う', () => {
    it('prelude環境から値を取り出す', function(next) {
      this.timeout('5s');
      Either.match(Env.lookup('succ', Env.prelude(emptyEnv)),{
        right: (value) => {
          expect(value).to.a("function")
          // Exp.match(value,{
          //   lambda: (arg, body) => {
          //     Exp.match(arg, {
          //       variable: (name) => {
          //         expect(name).to.eql("x")
          //       }
          //     });
          //   }
          // });
        },
        left: (value) => {
          expect().fail()
        },
      });
      // Either.match(Env.lookup('+', prelude),{
      //   right: (value) => {
      //     Exp.match(value,{
      //       lambda: (arg, body) => {
      //         Exp.match(arg, {
      //           variable: (name) => {
      //             expect(name).to.eql("x")
      //           }
      //         });
      //       }
      //     });
      //   },
      //   left: (value) => {
      //     expect().fail()
      //   },
      // });
      next();
    });
    it('算術演算子が存在する', function(next) {
      this.timeout('5s');
      const prelude = Env.prelude(Env.empty);
      ['+', '-', '*', '/', 'expt'].forEach(op => {
        Either.match(Env.lookup(op, prelude), {
          right: (value) => {
            expect(value).to.be.a('function')
          },
          left: (value) => {
            expect().fail()
          },
        });
      });
      next();
    });
    it('論理演算子が存在する', function(next) {
      this.timeout('5s');
      const prelude = Env.prelude(Env.empty);
      ['not', 'and', 'or'].forEach(op => {
        Either.match(Env.lookup(op, prelude), {
          right: (value) => {
            expect(value).to.be.a('function')
          },
          left: (value) => {
            expect().fail()
          },
        });
      });
      next();
    });
    it('日時関数が存在する', function(next) {
      this.timeout('5s');
      const prelude = Env.prelude(Env.empty);
      ['today!', 'now!'].forEach(op => {
        Either.match(Env.lookup(op, prelude), {
          right: (value) => {
            expect(value).to.be.a('function')
          },
          left: (value) => {
            expect().fail()
          },
        });
      });
      next();
    });
    it('ユーティリティ関数が存在する', function(next) {
      this.timeout('5s');
      const prelude = Env.prelude(Env.empty);
      ['BMI', 'CaloricNeeds', 'cons'].forEach(op => {
        Either.match(Env.lookup(op, prelude), {
          right: (value) => {
            expect(value).to.be.a('function')
          },
          left: (value) => {
            expect().fail()
          },
        });
      });
      next();
    });
  });
});
