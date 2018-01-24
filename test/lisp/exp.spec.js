'use strict';

const expect = require('expect.js'),
  env = require('../../lib/lisp/env.js'),
  ID = require('kansuu.js').monad.identity;
const Exp = require('../../lib/lisp/exp.js');

describe('式のテスト', () => {
  describe('数値の式のテスト', () => {
    it('数値の式を作る', (next) => {
      const number = Exp.num(1);
      Exp.match(number, {
        num: (value) => {
          expect(value).to.eql(1);
        //   expect(
        //     instance.type 
        //   ).to.eql(
        //     "num" 
        //   );
        //   expect(
        //     instance.value 
        //   ).to.eql(
        //     1
        //   );
        }
      });
      next();
    });
  });
});
