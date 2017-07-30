"use strict";

const __ = require('kansuu.js'),
      Pair = require('kansuu.js').pair,
      ID = require('kansuu.js').monad.identity,
      List = require('kansuu.js').monad.list,
      Either = require('kansuu.js').either,
      Maybe = require('kansuu.js').monad.maybe,
      expect = require('expect.js');
     // Parser = require('./parser.js');
// const evaluate = require('./semantics.js');

// const __ = require('../lib/kansuu.js'),
//   ID = require('../lib/kansuu.js').monad.identity,
//   Pair = require('../lib/kansuu.js').pair,
//   Maybe = require('../lib/kansuu.js').monad.maybe,
//   expect = require('expect.js');


// ### environment
const Env = {
  // ## 空の環境
  empty: (variable) => {
    return Maybe.nothing(variable);
  },
  /* 変数名に対応する値を環境から取りだす */
  lookup: (identifier, env) => {
    expect(identifier).to.a('string');
    return env(identifier);
  },
  /* 環境を拡張する */
  // extend:: Pair[String,Any] => FUN[]
  extend: (pair, oldEnv) => {
    return Pair.match(pair,{
      empty: (_) => {
        return Maybe.nothing(_);
      },
      cons: (identifier, value) => {
        expect(identifier).to.a('string');
        return (queryIdentifier) => {
          expect(queryIdentifier).to.a('string');
          if(identifier === queryIdentifier) {
            return Maybe.just(value);
          } else {
            return Env.lookup(queryIdentifier,oldEnv);
          }
        };
      }
    });
  }
};

// ### expression
const Exp = {
  fail: (_) => {
    return (pattern) => {
      return pattern.fail(_);
    };
  },
  number: (n) => {
    return (pattern) => {
      return pattern.number(n);
    };
  },
  bool: (value) => {
    return (pattern) => {
      return pattern.bool(value);
    };
  },
  /* 文字列の式 */
  string : (name) => {        
    return (pattern) => {
      return pattern.string(name);
    };
  },
  variable: (name) => {
    return (pattern) => {
      return pattern.variable(name);
    };
  },
  succ: (n) => {
    return (pattern) => {
      return pattern.succ(n);
    };
  },
  add: (n, m) => {
    return (pattern) => {
      return pattern.add(n,m);
    };
  },
  lambda: (variable, exp) => {
    expect(variable).to.a('function');
    return (pattern) => {
      return pattern.lambda(variable, exp);
    };
  },
  apply: (rator,rand) => {
    return (pattern) => {
      return pattern.apply(rator, rand);
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
  // apply: (rator) => {
  //   return (rand) => {
  //     if(__.typeOf(rator) === 'function'){
  //       return rator(rand);
  //     } else {
  //       return ID.unit(undefined);
  //     }
  //   };
  // },

const Parser = {

};

// ## evaluator 
const Evalator = {
  // ### plain#evaluate
  evaluate: (exp) => {
    return (environment) => {
      return match(exp, {
        fail: (_) => {
          return ID.unit(Maybe.nothing());
        },
        variable: (name) => {
          return ID.unit(Env.lookup(name, environment));
        },
        number: (n) => {
          expect(n).to.a('number');
          return ID.unit(Maybe.just(n));
        },
        bool: (value) => {
          expect(value).to.a('boolean');
          return ID.unit(Maybe.just(value));
        },
        succ: (exp)=> {
          return Maybe.flatMap(Plain.evaluate(exp)(environment))(n => {
            if(__.typeOf(n) === 'number') {
              return ID.unit(Maybe.just(n + 1));
            } else {
              return ID.unit(Maybe.nothing(n));
            }
          });
        },
        add: (expN,expM)=> {
          return Maybe.flatMap(Plain.evaluate(expN)(environment))(n => {
            return Maybe.flatMap(Plain.evaluate(expM)(environment))(m => {
              return ID.unit(Maybe.just(n + m));
            });
          });
        },
        lambda: (variable, bodyExp) => {
          return match(variable,{ 
            variable: (name) => {
              /* クロージャーを返す */
              return ID.unit(Maybe.just(
                (actualArg) => {
                  const newEnv = Env.extend(Pair.cons(name, actualArg),environment);
                  return Plain.evaluate(bodyExp)(newEnv);
                }
              ));
            }
          });
        },
        apply: (lambdaExp, arg) => {
          return Maybe.flatMap(Plain.evaluate(lambdaExp)(environment))(closure => {
            return Maybe.flatMap(Plain.evaluate(arg)(environment))(actualArg => {
              return ID.unit(closure(actualArg));
            });
          });
        }
      });
    };
  },
};


// // interpret:: STRING => Env => Either[Value]
// const interpret = (parser) => {
//   return (input) => {
//     const inputAsList = List.fromString(input);
//     return (env) => {
//       const parseResult = Parser.parse(parser)(inputAsList);
//       return List.match(parseResult,{
//         empty: (_) => {
//           return Either.left('Parse failure: nothing to be parsed');
//         },
//         cons: (head, tail) => {
//           if(List.isEmpty(Pair.right(head))) {
//             const anExp = Pair.left(head);
//             return Either.right(evaluate(anExp, env));

//           } else {
//             return Either.left("Parse failure:");
//           }
//         }
//       });
//     };
//   };
// };

// module.exports = interpret;
module.exports = {
  env: Env,
  exp: Exp,
  parser: Parser,
  evaluator: Evalator
};


