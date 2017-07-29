'use strict';

const expect = require('expect.js'),
  exp = require('../../lib/lisp/exp.js'),
  env = require('../../lib/lisp/env.js'),
  ID = require('kansuu.js').monad.identity;
const evaluate = require('../../lib/lisp/semantics.js');

describe('式の評価', () => {

  it('数値の評価のテスト', (next) => {
    expect(
      evaluate(exp.num(2), env.empty)
    ).to.eql(
      ID.unit(2)
    );
    next();
  });
  it('ブール値の評価のテスト', (next) => {
    expect(
      evaluate(exp.bool(true), env.empty)
    ).to.eql(
      ID.unit(true)
    );
    next();
  });
  it('if式の評価のテスト', (next) => {
    expect(
      evaluate(exp.if(exp.bool(true), exp.num(1), exp.num(0)),
          env.empty)
    ).to.eql(
      ID.unit(1)
    );
    expect(
      evaluate(exp.if(exp.bool(false), exp.num(1), exp.num(0)),
          env.empty)
    ).to.eql(
      ID.unit(0)
    );
    expect(
      evaluate(
        exp.if(exp.isEqual(exp.bool(false),exp.bool(false)), 
          exp.num(1), exp.num(0)),
        env.empty)
    ).to.eql(
      ID.unit(1)
    );
    expect(
      evaluate(
        exp.if(exp.isEqual(exp.bool(true),exp.bool(false)), 
          exp.num(1), exp.num(0)),
        env.empty)
    ).to.eql(
      ID.unit(0)
    );
    next();
  });
  describe('ブール演算のテスト', () => {
    it('andのテスト', (next) => {
      expect(
        evaluate(exp.and(
            exp.bool(true),exp.bool(true)
        ), env.empty)
      ).to.eql(
        ID.unit(true)
      );
      next();
    });
    it('orのテスト', (next) => {
      expect(
        evaluate(exp.or(
            exp.bool(false),exp.bool(false)
        ), env.empty)
      ).to.eql(
        ID.unit(false)
      );
      next();
    });
  });
  describe('数値演算のテスト', () => {
    it('addのテスト', (next) => {
      expect(
        evaluate(exp.add(
            exp.num(0),exp.num(1)
        ), env.empty)
      ).to.eql(
        ID.unit(1)
      );
      next();
    });
  });
});
