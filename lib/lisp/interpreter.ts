const Pair = require('kansuu.js').pair;
const List = require('kansuu.js').monad.list;
const Either = require('kansuu.js').either;

import Parser = require('./parser');
import evaluate = require('./semantics');

type Env = (name: string) => any;

const Self = {
  run: (input: string) => (environment: Env): any => {
    return List.match(Parser.parse(Parser.expression)(List.fromString(input)), {
      empty: (_: any) => {
        return Either.left(null);
      },
      cons: (head: any, tail: any) => {
        return Pair.match(head, {
          cons: (anExp: any, right: any) => {
            return evaluate(anExp, environment);
          }
        })
      }
    });
  },
  compile: (input: string): any => {
    return List.match(Parser.parse(Parser.expression)(List.fromString(input)), {
      empty: (_: any) => {
        throw new Error(`Parse Error: ${input}`)
      },
      cons: (head: any, tail: any) => {
        return Pair.match(head, {
          cons: (anExp: any, right: any) => {
            return anExp;
          }
        })
      }
    });
  }
};

export = Self;
