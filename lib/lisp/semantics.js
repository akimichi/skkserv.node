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
    /* 関数定義（λ式）の評価  */
    lambda: (variable, body) => {
      return Exp.match(variable,{
        variable: (name) => {
          return M.unit(actualArg => { // クロージャーを返す
            const newEnv = Env.extend(name, actualArg)(environment);
            return evaluate(body, newEnv); 
          });
        }
      });
    },
    /* 関数適用の評価 */
    app: (operator, operand) => {
      return Exp.match(operator,{
        variable: (name) => {
          return M.flatMap(evaluate(operator, environment))(lambda => {
            return M.flatMap(evaluate(lambda, environment))(closure => {
              return M.flatMap(evaluate(operand, environment))(actualArg => {
                return closure(actualArg); 
              });
            });
          });
        },
        lambda: (arg, bodyExp) => {
          return M.flatMap(evaluate(operator, environment))(closure => {
            return M.flatMap(evaluate(operand, environment))(actualArg => {
              return closure(actualArg); 
            });
          });
        },
        app: (_, __) => {
          return M.flatMap(evaluate(operator, environment))(closure => {
            return M.flatMap(evaluate(operand, environment))(actualArg => {
              return closure(actualArg); 
            });
          });
        }
      });
      // return M.flatMap(evaluate(lambda, environment))(closure => {
      //   return M.flatMap(evaluate(arg, environment))(actualArg => {
      //     return closure(actualArg); 
      //   });
      // });
      //
      // return Exp.match(operator,{
      //   lambda: (variable, bodyExpression) => {
      //     return M.flatMap(evaluate(operator, environment))(closure => {
      //       return M.flatMap(evaluate(operand, environment))((actualArg) => {
      //         return closure(actualArg); 
      //       });
      //     });
      //   },
      //   app: (operator_, operand_) => {
      //     return M.flatMap(evaluate(operator_, environment))(closure => {
      //       return M.flatMap(evaluate(operand_, environment))(actualArg => {
      //         return M.unit(closure(actualArg)); 
      //       });
      //     });
      //   }
      // });
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
    succ: (exp) => {
      return M.flatMap(evaluate(exp, environment))(value => {
        return M.unit(value + 1); 
      });
    },
    //  足し算の評価 
    add: (expL, expR) => {
      return M.flatMap(evaluate(expL, environment))(valueL => {
        return M.flatMap(evaluate(expR, environment))(valueR => {
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
    today_: (_) => {
      const now = new Date();
      return M.unit(now.toLocaleDateString()); 
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
