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

const Self = {
// interpret:: STRING => Env => Either[Value]

};

// ## evaluator 
// const Evalator = {
//   // ### plain#evaluate
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
//                   const newEnv = Env.extend(Pair.cons(name, actualArg),environment);
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

// module.exports = {
//   env: Env,
//   exp: Exp,
//   parser: Parser,
//   evaluator: Evalator
// };


module.exports = Self;
