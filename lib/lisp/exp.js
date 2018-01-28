"use strict";


module.exports = {
  type: (pattern) => {
    return pattern.exp();
  },
  /* 式のパターンマッチ関数 */
  match : (data, pattern) => { 
    return data(pattern);
  },
  /* atomの式 */
  atom : (value) => {
    return (pattern) => {
      return pattern.atom(value);
    };
  },
  /* リストの式 */
  list : (items) => {
    return (pattern) => {
      return pattern.list(items);
    };
  },
  /* 変数の式 */
  variable : (name) => {
    return (pattern) => {
      return pattern.variable(name);
    };
  },
  /* 関数定義の式(λ式) */
  lambda: (variable, body) => { 
    return (pattern) => {
      return pattern.lambda(variable, body);
    };
  },
  /* 関数適用の式 */
  app: (lambda, arg) => { 
    return (pattern) => {
      return pattern.app(lambda, arg);
    };
  },
  /* 数値の式 */
  num: (value) => {
    return (pattern) => {
      return pattern.num(value);
    };
  },
  /* ブール値の式 */
  bool: (value) => {
    return (pattern) => {
      return pattern.bool(value);
    };
  },
  /* 文字列の式 */
  string : (content) => {
    return (pattern) => {
      return pattern.string(content);
    };
  },
  /* 識別子の式 */
  identifier : (name) => {
    return (pattern) => {
      return pattern.identifier(name);
    };
  },
  conditional: (predicate, trueExp, falseExp) => { 
    return (pattern) => {
      return pattern.conditional(predicate, trueExp, falseExp);
    };
  },
  isEqual : (expL,expR) => {
    return (pattern) => {
      return pattern.isEqual(expL, expR);
    };
  },
  and : (expL,expR) => {
    return (pattern) => {
      return pattern.and(expL, expR);
    };
  },
  or : (expL,expR) => {
    return (pattern) => {
      return pattern.or(expL, expR);
    };
  },
  /* 足し算の式 */
  add : (expL,expR) => {
    return (pattern) => {
      return pattern.add(expL, expR);
    };
  },
  subtract : (expL,expR) => {
    return (pattern) => {
      return pattern.subtract(expL, expR);
    };
  },
  multiply : (expL,expR) => {
    return (pattern) => {
      return pattern.multiply(expL, expR);
    };
  },
  divide : (expL,expR) => {
    return (pattern) => {
      return pattern.divide(expL, expR);
    };
  }
};
