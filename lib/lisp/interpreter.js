"use strict";

const exp = require('./exp.js'),
      Pair = require('kansuu.js').pair,
      List = require('kansuu.js').monad.list,
      Either = require('kansuu.js').either,
      Maybe = require('kansuu.js').monad.maybe,
      Parser = require('./parser.js');
const evaluate = require('./semantics.js');

// interpret:: STRING => Env => Either[Value]
const interpret = (parser) => {
  return (input) => {
    const inputAsList = List.fromString(input);
    return (env) => {
      const parseResult = Parser.parse(parser)(inputAsList);
      return List.match(parseResult,{
        empty: (_) => {
          return Either.left('Parse failure: nothing to be parsed');
        },
        cons: (head, tail) => {
          if(List.isEmpty(Pair.right(head))) {
            const anExp = Pair.left(head);
            return Either.right(evaluate(anExp, env));

          } else {
            return Either.left("Parse failure:");
          }
        }
      });
    };
  };
};


module.exports = interpret;
