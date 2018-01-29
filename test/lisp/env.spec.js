'use strict';

const expect = require('expect.js'),
  env = require('../../lib/lisp/env.js'),
  ID = require('kansuu.js').monad.identity,
  Either = require('kansuu.js').monad.either;
const Env = require('../../lib/lisp/env.js');

describe('環境のテスト', () => {
  describe('lookupで値を取り出す', () => {
    it('空の環境から値を取り出す', (next) => {
      const emptyEnv = Env.empty;
      Either.match(Env.lookup('dummy', emptyEnv),{
        right: (value) => {
          expect().fail()
        },
        left: (value) => {
          expect(value).to.eql(undefined)
        },
      });
      // expect(
      //   Env.lookup('dummy', emptyEnv)
      // ).to.eql(undefined)
      next();
    });
    it('拡張された環境から値を取り出す', (next) => {
      const emptyEnv = Env.empty,
        initEnv = Env.extend('a', 1)(emptyEnv);
      Either.match(Env.lookup('a', initEnv),{
        right: (value) => {
          expect(value).to.eql(1)
        },
        left: (value) => {
          expect().fail()
        },
      });
      // expect(
      //     Env.lookup('a', initEnv)
      //     ).to.eql(1)
      next();
    });
  });
});
