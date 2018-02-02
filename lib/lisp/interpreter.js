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
          }
        })
      }
    });
  }
};

module.exports = Self;
