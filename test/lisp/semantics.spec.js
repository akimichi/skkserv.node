'use strict';

const expect = require('expect.js'),
  Exp = require('../../lib/lisp/exp.js'),
  Env = require('../../lib/lisp/env.js'),
  ID = require('kansuu.js').monad.identity;
const evaluate = require('../../lib/lisp/semantics.js');

describe('式の評価', () => {
  describe('atomの評価', () => {
    it('数値の評価のテスト', (next) => {
      expect(
          evaluate(Exp.atom(2), Env.empty)
          ).to.eql(
            ID.unit(2)
            );
      next();
    });
    it('ブール値の評価のテスト', (next) => {
      expect(
          evaluate(Exp.atom(true), Env.empty)
          ).to.eql(
            ID.unit(true)
            );
      next();
    });
    it('文字列の評価のテスト', (next) => {
      expect(
          evaluate(Exp.atom("これは文字列です"), Env.empty)
          ).to.eql(
            ID.unit("これは文字列です")
            );
      next();
    });
  });
  describe('変数評価のテスト', () => {
    it('環境から変数の値を取り出すテスト', (next) => {
      const emptyEnv = Env.empty,
      initEnv = Env.extend('a', 1)(emptyEnv);
      expect(
          evaluate(Exp.variable("a"), initEnv)
          ).to.eql(
            ID.unit(1)
            );
      next();
    });
    it('存在しない変数は、評価されると undefined となる', (next) => {
      const emptyEnv = Env.empty,
      initEnv = Env.extend('a', 1)(emptyEnv);
      expect(
          evaluate(Exp.variable("b"), initEnv)
          ).to.eql(
            ID.unit(undefined)
            );
      next();
    });
  });
  describe('ブール演算のテスト', () => {
    it('andのテスト', (next) => {
      expect(
        evaluate(Exp.and(
          Exp.bool(true),Exp.bool(true)
        ), Env.empty)
      ).to.eql(
        ID.unit(true)
      );
      next();
    });
    it('orのテスト', (next) => {
      expect(
        evaluate(Exp.or(
          Exp.bool(false),Exp.bool(false)
        ), Env.empty)
      ).to.eql(
        ID.unit(false)
      );
      next();
    });
  });
  describe('数値演算のテスト', () => {
    it('addのテスト', (next) => {
      expect(
        evaluate(Exp.add(
            Exp.num(0),Exp.num(1)
        ), Env.empty)
      ).to.eql(
        ID.unit(1)
      );
      next();
    });
  });
  describe('関数適用のテスト', () => {
    it('id(1)のテスト', (next) => {
      const x = Exp.variable("x"),
        id = Exp.lambda(x, x);
      expect(
        evaluate(Exp.app(
          id, Exp.num(1)
        ), Env.empty)
      ).to.eql(
        ID.unit(1)
      );
      next();
    });
  });
  it('if式の評価のテスト', (next) => {
    expect(
      evaluate(Exp.conditional(Exp.bool(true), Exp.num(1), Exp.num(0)),
          Env.empty)
    ).to.eql(
      ID.unit(1)
    );
    expect(
      evaluate(Exp.conditional(Exp.bool(false), Exp.num(1), Exp.num(0)),
          Env.empty)
    ).to.eql(
      ID.unit(0)
    );
    expect(
      evaluate(
        Exp.conditional(Exp.isEqual(Exp.bool(false),Exp.bool(false)), 
          Exp.num(1), Exp.num(0)),
        Env.empty)
    ).to.eql(
      ID.unit(1)
    );
    expect(
      evaluate(
        Exp.conditional(Exp.isEqual(Exp.bool(true),Exp.bool(false)), 
          Exp.num(1), Exp.num(0)),
        Env.empty)
    ).to.eql(
      ID.unit(0)
    );
    next();
  });
});
