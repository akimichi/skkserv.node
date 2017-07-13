'use strict';

const expect = require('expect.js'),
 exp = require('../../lib/lisp/exp.js'),
 ID = require('../../lib/lisp/monad.js').ID,
 semantics = require('../../lib/lisp/semantics.js');

describe('式', () => {
  const env = semantics.env;

  it('数値の評価のテスト', (next) => {
    expect(
      semantics.evaluate(exp.num(2), env.empty)
    ).to.eql(
      ID.unit(2)
    );
    next();
  });
});
