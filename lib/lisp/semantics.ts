import Exp = require('./exp');
import Env = require('./env');
const M = require('kansuu.js').monad.either;

const expect = require('expect.js');
const Pair = require('kansuu.js').pair;
const List = require('kansuu.js').monad.list;

type Env = (name: string) => any;

const evaluate = (anExp: any, environment: Env): any => {
  return Exp.match(anExp, {
    atom: (value: any) => {
      return M.unit(value);
    },
    variable: (name: string) => {
      return Env.lookup(name, environment);
    },
    lambda: (variable: any, body: any) => {
      return Exp.match(variable, {
        variable: (name: string) => {
          return M.unit((actualArg: any) => {
            const newEnv = Env.extend(name, actualArg)(environment);
            return evaluate(body, newEnv);
          });
        }
      });
    },
    app: (operator: any, operand: any) => {
      return Exp.match(operator, {
        variable: (name: string) => {
          return M.flatMap(evaluate(operator, environment))((lambda: any) => {
            return M.flatMap(evaluate(lambda, environment))((closure: any) => {
              return M.flatMap(evaluate(operand, environment))((actualArg: any) => {
                return closure(actualArg);
              });
            });
          });
        },
        lambda: (arg: any, bodyExp: any) => {
          return M.flatMap(evaluate(operator, environment))((closure: any) => {
            return M.flatMap(evaluate(operand, environment))((actualArg: any) => {
              return closure(actualArg);
            });
          });
        },
        app: (_: any, __: any) => {
          return M.flatMap(evaluate(operator, environment))((closure: any) => {
            return M.flatMap(evaluate(operand, environment))((actualArg: any) => {
              return closure(actualArg);
            });
          });
        }
      });
    },
    list: (items: any) => {
      return M.unit(items);
    },
    nil: () => {
      return M.unit(List.empty());
    },
    cons: (expL: any, expR: any) => {
      return M.flatMap(evaluate(expL, environment))((head: any) => {
        return M.flatMap(evaluate(expR, environment))((tail: any) => {
          return M.unit(List.cons(head, tail));
        });
      });
    },
    ifExpr: (predicate: any, consequent: any, alternative: any) => {
      return M.flatMap(evaluate(predicate, environment))((judge: boolean) => {
        if (judge === true) {
          return M.flatMap(evaluate(consequent, environment))((value: any) => {
            return M.unit(value);
          });
        } else {
          return M.flatMap(evaluate(alternative, environment))((value: any) => {
            return M.unit(value);
          });
        }
      });
    },
    and: (expL: any, expR: any) => {
      return M.flatMap(evaluate(expL, environment))((valueL: any) => {
        return M.flatMap(evaluate(expR, environment))((valueR: any) => {
          return M.unit(valueL && valueR);
        });
      });
    },
    or: (expL: any, expR: any) => {
      return M.flatMap(evaluate(expL, environment))((valueL: any) => {
        return M.flatMap(evaluate(expR, environment))((valueR: any) => {
          return M.unit(valueL || valueR);
        });
      });
    },
    not: (exp: any) => {
      return M.flatMap(evaluate(exp, environment))((value: any) => {
        return M.unit(!value);
      });
    },
    succ: (exp: any) => {
      return M.flatMap(evaluate(exp, environment))((value: number) => {
        return M.unit(value + 1);
      });
    },
    add: (expL: any, expR: any) => {
      return M.flatMap(evaluate(expL, environment))((valueL: number) => {
        return M.flatMap(evaluate(expR, environment))((valueR: number) => {
          return M.unit(valueL + valueR);
        });
      });
    },
    subtract: (expL: any, expR: any) => {
      return M.flatMap(evaluate(expL, environment))((valueL: number) => {
        return M.flatMap(evaluate(expR, environment))((valueR: number) => {
          return M.unit(valueL - valueR);
        });
      });
    },
    multiply: (expL: any, expR: any) => {
      return M.flatMap(evaluate(expL, environment))((valueL: number) => {
        return M.flatMap(evaluate(expR, environment))((valueR: number) => {
          return M.unit(valueL * valueR);
        });
      });
    },
    divide: (expL: any, expR: any) => {
      return M.flatMap(evaluate(expL, environment))((valueL: number) => {
        return M.flatMap(evaluate(expR, environment))((valueR: number) => {
          return M.unit(valueL / valueR);
        });
      });
    },
    expt: (base: any, exponent: any) => {
      return M.flatMap(evaluate(base, environment))((baseValue: number) => {
        return M.flatMap(evaluate(exponent, environment))((exponentValue: number) => {
          return M.unit(Math.pow(baseValue, exponentValue));
        });
      });
    },
    today_: (_: any) => {
      require('date-utils');
      const now = new Date();
      return M.unit([now.toFormat("YYYY-MM-DD"), now.toFormat("YYYY年MM月DD日")]);
    },
    now_: (_: any) => {
      const now = new Date();
      return M.unit(now.toLocaleTimeString());
    },
    isEqual: (expL: any, expR: any) => {
      return M.flatMap(evaluate(expL, environment))((valueL: any) => {
        return M.flatMap(evaluate(expR, environment))((valueR: any) => {
          return M.unit(valueL === valueR);
        });
      });
    }
  });
}

export = evaluate;
