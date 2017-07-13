"use strict";

module.exports = {
  /* 式のパターンマッチ関数 */
  match : (data, pattern) => { 
    return data(pattern);
  },
  /* 数値の式 */
  num: (value) => {             
    return (pattern) => {
      return pattern.num(value);
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
  /* 足し算の式 */
  add : (expL,expR) => {        
    return (pattern) => {
      return pattern.add(expL, expR);
    };
  }
};
