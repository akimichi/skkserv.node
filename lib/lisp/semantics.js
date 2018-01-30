"use strict";

const Exp = require('./exp.js'),
  Env = require('./env.js'),
  M = require('kansuu.js').monad.either;
  // M = require('kansuu.js').monad.identity;

const expect = require('expect.js'),
 kansuu = require('kansuu.js'),
 Pair = require('kansuu.js').pair,
 List = require('kansuu.js').monad.list,
 ID = require('kansuu.js').monad.identity;

const evaluate = (anExp, environment) => {
  return Exp.match(anExp,{
    //  atomの評価
    atom: (value) => {
      return M.unit(value);
    },
    //  変数の評価
    variable: (name) => {
      return Env.lookup(name, environment);
      // return M.unit(env.lookup(name, environment));
    },
    //  リストの評価
    list: (items) => {
      List.match(items, {
        empty: (_) => {
          return M.unit(List.empty());
        },
        cons: (head, tail) => {
          // headの評価
          Exp.match(head, {
            atom: (value) => {
              return M.unit(value);
            },
            list: (items) => {
            },
            variable: (name) => {
              Exp.match(evaluate(head, environment), {
                atom: (value) => {
                  return M.unit(value);
                },
                list: (items) => {
                },
                lambda: (arg, body) => {
                  List.foldl1(tail)(item => accumulator => {
                    return Either.flatMap(evaluate(Exp.app(head,item), environment))(result => {
                      return Either.unit(result); 
                    })
                  });
                },
              });
            },
          });

          Exp.match(evaluate(head, environment), {
              atom: (value) => {
                return M.unit(value);
              },
              list: (items) => {
              },
              variable: (name) => {
              },
          });
          // List.map(tail)(item => {
          //   return evaluate(item, environment);
          // });
        }
      });
    },
    // //  数値の評価
    // num: (numericValue) => {
    //   return M.unit(numericValue);
    // },
    // //  ブール値の評価
    // bool: (booleanValue) => {
    //   return M.unit(booleanValue);
    // },
    // //  文字列の評価
    // string: (stringValue) => {
    //   return M.unit(stringValue);
    // },
    /* 関数定義（λ式）の評価では、クロージャーを返す  */
    lambda: (variable, body) => {
      return Exp.match(variable,{
        variable: (name) => {
          return M.unit(actualArg => {
            const newEnv = Env.extend(name, actualArg)(environment);
            return evaluate(body, 
              Env.extend(name, actualArg)(newEnv));
          });
        }
      });
    },
    /* 関数適用の評価 */
    app: (operator, operand) => {
      return Exp.match(operator,{
        lambda: (variable, bodyExpression) => {
          return M.flatMap(evaluate(operator, environment))(closure => {
            return M.flatMap(evaluate(operand, environment))((actualArg) => {
              return closure(actualArg); 
            });
          });
        }
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

// ## evaluator 
// const Evalator = {
//   evaluate: (exp) => {
//     return (environment) => {
//       return match(exp, {
//         fail: (_) => {
//           return ID.unit(Maybe.nothing());
//         },
//         variable: (name) => {
//           return ID.unit(Env.lookup(name, environment));
//         },
//         number: (n) => {
//           expect(n).to.a('number');
//           return ID.unit(Maybe.just(n));
//         },
//         bool: (value) => {
//           expect(value).to.a('boolean');
//           return ID.unit(Maybe.just(value));
//         },
//         succ: (exp)=> {
//           return Maybe.flatMap(Plain.evaluate(exp)(environment))(n => {
//             if(__.typeOf(n) === 'number') {
//               return ID.unit(Maybe.just(n + 1));
//             } else {
//               return ID.unit(Maybe.nothing(n));
//             }
//           });
//         },
//         add: (expN,expM)=> {
//           return Maybe.flatMap(Plain.evaluate(expN)(environment))(n => {
//             return Maybe.flatMap(Plain.evaluate(expM)(environment))(m => {
//               return ID.unit(Maybe.just(n + m));
//             });
//           });
//         },
//         lambda: (variable, bodyExp) => {
//           return match(variable,{ 
//             variable: (name) => {
//               /* クロージャーを返す */
//               return ID.unit(Maybe.just(
//                 (actualArg) => {
//                   const newEnv = Env.extend(Pair.cons(name, actualArg))(environment);
//                   return Plain.evaluate(bodyExp)(newEnv);
//                 }
//               ));
//             }
//           });
//         },
//         apply: (lambdaExp, arg) => {
//           return Maybe.flatMap(Plain.evaluate(lambdaExp)(environment))(closure => {
//             return Maybe.flatMap(Plain.evaluate(arg)(environment))(actualArg => {
//               return ID.unit(closure(actualArg));
//             });
//           });
//         }
//       });
//     };
//   },
// };
module.exports = evaluate;
