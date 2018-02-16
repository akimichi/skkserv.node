'use strict';

const expect = require('expect.js'),
  env = require('../../lib/lisp/env.js'),
  ID = require('kansuu.js').monad.identity;
const Exp = require('../../lib/lisp/exp.js');

describe('式のテスト', () => {
  describe('数値の式のテスト', () => {
    it('数値の式を作る', (next) => {
      const number = Exp.atom(1);
      Exp.match(number, {
        atom: (value) => {
          expect(value).to.eql(1);
        }
      });
      next();
    });
  });
  describe('lambdaの式のテスト', () => {
    it('lambdaの式を作る', (next) => {
      const lambdaExpression = Exp.lambda(Exp.variable('x'), Exp.variable('x'));
      Exp.match(lambdaExpression, {
        lambda: (arg, body) => {
          Exp.match(arg, {
            variable: (name) => {
              expect(name).to.eql('x');
            }
          })
        }
      });
      next();
    });
  });
});
