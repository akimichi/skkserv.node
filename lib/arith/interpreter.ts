const Pair = require('kansuu.js').pair;
const List = require('kansuu.js').monad.list;
const Either = require('kansuu.js').either;

import Parser = require('./parser');
import evaluate = require('./semantics');

const Self = {
  run: (input: string): any => {
    return List.match(Parser.parse(Parser.expression)(List.fromString(input)), {
      empty: (_: any) => {
        return Either.left("パースエラー");
      },
      cons: (head: any, tail: any) => {
        return Pair.match(head, {
          cons: (anExp: any, right: any) => {
            return evaluate(anExp);
          }
        });
      }
    });
  },
  compile: (input: string): any => {
    return List.match(Parser.parse(Parser.expression)(List.fromString(input)), {
      empty: (_: any) => {
        throw new Error(`Parse Error: ${input}`);
      },
      cons: (head: any, tail: any) => {
        return Pair.match(head, {
          cons: (anExp: any, right: any) => {
            return anExp;
          }
        });
      }
    });
  }
};

export = Self;
