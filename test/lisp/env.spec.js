'use strict';

const expect = require('expect.js'),
  env = require('../../lib/lisp/env.js'),
  ID = require('kansuu.js').monad.identity;
const Env = require('../../lib/lisp/env.js');

describe('環境のテスト', () => {
  describe('lookupで値を取り出す', () => {
    it('空の環境から値を取り出す', (next) => {
      const emptyEnv = Env.empty;
      expect(
          Env.lookup('dummy', emptyEnv)
          ).to.eql(undefined)
        next();
    });
    it('拡張された環境から値を取り出す', (next) => {
      const emptyEnv = Env.empty,
        initEnv = Env.extend('a', 1)(emptyEnv);
      expect(
          Env.lookup('a', initEnv)
          ).to.eql(1)
        next();
    });
  });
});
