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
  nil : (_) => {
    return (pattern) => {
      return pattern.nil();
    };
  },
  cons : (head, tail) => {
    return (pattern) => {
      return pattern.cons(head, tail);
    };
  },
  /* 変数の式 */
  variable : (name) => {
    return (pattern) => {
      return pattern.variable(name);
    };
  },
  /* 関数定義の式(λ式) */
  lambda: (variable, bodyExpression) => { 
    return (pattern) => {
      return pattern.lambda(variable, bodyExpression);
    };
  },
  /* 関数適用の式 */
  app: (operator, operand) => { 
    return (pattern) => {
      return pattern.app(operator, operand);
    };
  },
  /* 識別子の式 */
  identifier : (name) => {
    return (pattern) => {
      return pattern.identifier(name);
    };
  },
  ifExpr: (predicate, consequent, alternative) => { 
    return (pattern) => {
      return pattern.ifExpr(predicate, consequent, alternative);
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
  or: (expL,expR) => {
    return (pattern) => {
      return pattern.or(expL, expR);
    };
  },
  not: (exp) => {
    return (pattern) => {
      return pattern.not(exp);
    };
  },
  succ: (exp) => {
    return (pattern) => {
      return pattern.succ(exp);
    };
  },
  /* 足し算の式 */
  add: (expL,expR) => {
    return (pattern) => {
      return pattern.add(expL, expR);
    };
  },
  subtract: (expL,expR) => {
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
  },
  today_ : (_) => {
    return (pattern) => {
      return pattern.today_(_);
    };
  },
  now_ : (_) => {
    return (pattern) => {
      return pattern.now_(_);
    };
  }
};
