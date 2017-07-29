"use strict";

const exp = require('./exp.js'),
      Pair = require('kansuu.js').pair,
      List = require('kansuu.js').monad.list,
      Either = require('kansuu.js').either,
      Maybe = require('kansuu.js').monad.maybe,
      Parser = require('./parser.js');
const evaluate = require('./semantics.js');

// interpret:: STRING => Env => Either[Value]
const interpret = (input) => {
  return (env) => {
   const parseResult = Parser.parse(input);
   return List.match(parseResult,{
     empty: (_) => {
       return Either.left('');
     },
     cons: (head, tail) => {
       if(List.isEmpty(Pair.right(head))) {
         const anExp = Pair.left(head);
         return Either.right(evaluate(anExp, env));

       } else {
        return Either.left("");
       }
     }
   }
  };
};

