"use strict";

const exp = require('./exp.js'),
  env = require('./env.js'),
  M = require('kansuu.js').monad.identity;

const evaluate = (anExp, environment) => {
  return exp.match(anExp,{
    //  atomの評価
    atom: (value) => {
      return M.unit(value);
    },
    //  リストの評価
    list: (items) => {

      return M.unit(value);
    },
    //  数値の評価
    num: (numericValue) => {
      return M.unit(numericValue);
    },
    //  ブール値の評価
    bool: (booleanValue) => {
      return M.unit(booleanValue);
    },
    //  文字列の評価
    string: (stringValue) => {
      return M.unit(stringValue);
    },
    //  変数の評価
    variable: (name) => {
      return M.unit(env.lookup(name, environment));
    },
    /* 関数定義（λ式）の評価  */
    lambda: (variable, body) => {
      return exp.match(variable,{
        variable: (name) => {
          return M.unit((actualArg) => {
            return evaluate(body, 
              env.extend(name, actualArg, environment));
          });
        }
      });
    },
    /* 関数適用の評価 */
    app: (lambda, arg) => {
      return M.flatMap(evaluate(lambda, environment))((closure) => {
        return M.flatMap(evaluate(arg, environment))((actualArg) => {
          return closure(actualArg); 
        });
      });
    },
    conditional: (predicate, trueExp, falseExp) => {
      return M.flatMap(evaluate(predicate, environment))((judge) => {
        if(judge === true) {
          return M.flatMap(evaluate(trueExp, environment))((value) => {
            return M.unit(value); 
          });
        } else {
          return M.flatMap(evaluate(falseExp, environment))((value) => {
            return M.unit(value); 
          });
        }
      });
    },
    and: (expL, expR) => {
      return M.flatMap(evaluate(expL, environment))((valueL) => {
        return M.flatMap(evaluate(expR, environment))((valueR) => {
          return M.unit(valueL && valueR); 
        });
      });
    },
    or: (expL, expR) => {
      return M.flatMap(evaluate(expL, environment))((valueL) => {
        return M.flatMap(evaluate(expR, environment))((valueR) => {
          return M.unit(valueL || valueR); 
        });
      });
    },
    //  足し算の評価 
    add: (expL, expR) => {
      return M.flatMap(evaluate(expL, environment))((valueL) => {
        return M.flatMap(evaluate(expR, environment))((valueR) => {
          return M.unit(valueL + valueR); 
        });
      });
    },
    subtract: (expL, expR) => {
      return M.flatMap(evaluate(expL, environment))((valueL) => {
        return M.flatMap(evaluate(expR, environment))((valueR) => {
          return M.unit(valueL - valueR); 
        });
      });
    },
    multiply: (expL, expR) => {
      return M.flatMap(evaluate(expL, environment))((valueL) => {
        return M.flatMap(evaluate(expR, environment))((valueR) => {
          return M.unit(valueL * valueR); 
        });
      });
    },
    divide: (expL, expR) => {
      return M.flatMap(evaluate(expL, environment))((valueL) => {
        return M.flatMap(evaluate(expR, environment))((valueR) => {
          return M.unit(valueL / valueR); 
        });
      });
    },
    isEqual: (expL, expR) => {
      return M.flatMap(evaluate(expL, environment))((valueL) => {
        return M.flatMap(evaluate(expR, environment))((valueR) => {
          return M.unit(valueL === valueR); 
        });
      });
    }
  });
}

module.exports = evaluate;
