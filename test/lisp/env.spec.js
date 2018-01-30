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
  describe('prelude環境を使う', () => {
    it('prelude環境から値を取り出す', (next) => {
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
  });
});
