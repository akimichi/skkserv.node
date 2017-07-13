"use strict";

const exp = require('./exp.js'),
  env = require('./env.js'),
  ID = require('./monad.js').ID;

const evaluate = (anExp, environment) => {
  return exp.match(anExp,{
    //  数値の評価
    num: (numericValue) => {        
      return ID.unit(numericValue);
    },
    //  ブール値の評価
    bool: (booleanValue) => {        
      return ID.unit(booleanValue);
    },
    //  変数の評価
    variable: (name) => {           
      return ID.unit(env.lookup(name, environment));
    },
    /* 関数定義（λ式）の評価  */
    lambda: (variable, body) => {   
      return exp.match(variable,{
        variable: (name) => {
          return ID.unit((actualArg) => {
            return evaluate(body, 
              env.extend(name, actualArg, environment));
          });
        }
      });
    },
    /* 関数適用の評価 */
    app: (lambda, arg) => {         
      return ID.flatMap(evaluate(lambda, environment))((closure) => {
        return ID.flatMap(evaluate(arg, environment))((actualArg) => {
          return closure(actualArg); 
        });
      });
    },
    and: (expL, expR) => {          
      return ID.flatMap(evaluate(expL, environment))((valueL) => {
        return ID.flatMap(evaluate(expR, environment))((valueR) => {
          return ID.unit(valueL && valueR); 
        });
      });
    },
    or: (expL, expR) => {          
      return ID.flatMap(evaluate(expL, environment))((valueL) => {
        return ID.flatMap(evaluate(expR, environment))((valueR) => {
          return ID.unit(valueL || valueR); 
        });
      });
    },
    //  足し算の評価 
    add: (expL, expR) => {          
      return ID.flatMap(evaluate(expL, environment))((valueL) => {
        return ID.flatMap(evaluate(expR, environment))((valueR) => {
          return ID.unit(valueL + valueR); 
        });
      });
    },
    subtract: (expL, expR) => {          
      return ID.flatMap(evaluate(expL, environment))((valueL) => {
        return ID.flatMap(evaluate(expR, environment))((valueR) => {
          return ID.unit(valueL - valueR); 
        });
      });
    },
    multiply: (expL, expR) => {          
      return ID.flatMap(evaluate(expL, environment))((valueL) => {
        return ID.flatMap(evaluate(expR, environment))((valueR) => {
          return ID.unit(valueL * valueR); 
        });
      });
    },
    divide: (expL, expR) => {          
      return ID.flatMap(evaluate(expL, environment))((valueL) => {
        return ID.flatMap(evaluate(expR, environment))((valueR) => {
          return ID.unit(valueL / valueR); 
        });
      });
    },
    isEqual: (expL, expR) => {          
      return ID.flatMap(evaluate(expL, environment))((valueL) => {
        return ID.flatMap(evaluate(expR, environment))((valueR) => {
          return ID.unit(valueL === valueR); 
        });
      });
    }
  });
}

module.exports = evaluate;
