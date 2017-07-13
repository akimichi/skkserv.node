"use strict";

const exp = require('./exp.js'),
  ID = require('./monad.js').ID;

module.exports = {
  env: {
    /* 空の環境を作る */
    /* empty:: STRING => VALUE */
    empty: (variable) => {                        
      return undefined;
    },
    /* 変数名に対応する値を環境から取り出す */
    /* lookup:: (STRING, ENV) => VALUE */
    lookup : (name, environment) => {       
      return environment(name);
    },
    /* 環境を拡張する */
    /* extend:: (STRING, VALUE, ENV) => ENV */
    extend: (identifier, value, environment) => { 
      return (queryIdentifier) => {
        if(identifier === queryIdentifier) {
          return value;
        } else {
          return env.lookup(queryIdentifier,environment);
        }
      };
    }
  },
  evaluate: (anExp, environment) => {
    return exp.match(anExp,{
      //  数値の評価
      num: (numericValue) => {        
        return ID.unit(numericValue);
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
      //  足し算の評価 
      add: (expL, expR) => {          
        return ID.flatMap(evaluate(expL, environment))((valueL) => {
          return ID.flatMap(evaluate(expR, environment))((valueR) => {
            return ID.unit(valueL + valueR); 
          });
        });
      }
    });
  }
}
