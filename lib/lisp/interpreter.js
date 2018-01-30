"use strict";

const __ = require('kansuu.js'),
      Pair = require('kansuu.js').pair,
      ID = require('kansuu.js').monad.identity,
      List = require('kansuu.js').monad.list,
      Either = require('kansuu.js').either,
      Maybe = require('kansuu.js').monad.maybe,
      expect = require('expect.js'),
      Parser = require('./parser.js'),
      evaluate = require('./semantics.js');

const Self = {
  // run:: STRING => Env => Either[Value]
  run: (input) => (environment) => {
    return List.match(Parser.parse(Parser.expression)(List.fromString(input)),{
      empty: (_) => {
        return Either.left(null);
      },
      cons: (head, tail) => {
        return Pair.match(head, {
          cons: (left, right) => {
            return evaluate(left, environment);
            // return Either.right(evaluate(left, environment));
          }
        })
      }
    });
  }

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

// module.exports = {
//   env: Env,
//   exp: Exp,
//   parser: Parser,
//   evaluator: Evalator
// };


module.exports = Self;
