const Pair = require('kansuu.js').pair;
const List = require('kansuu.js').monad.list;
const Either = require('kansuu.js').either;

import Parser = require('./parser');
import evaluate = require('./semantics');

const Self = {
  run: (input: string): any => {
    return List.match(Parser.parse(Parser.expression)(List.fromString(input)), {
      empty: (_: any) => {
        return Either.left(`未知の日時キーワード: ${input}`);
      },
      cons: (head: any, tail: any) => {
        return Pair.match(head, {
          cons: (anExp: any, rest: any) => {
            return evaluate(anExp);
          }
        });
      }
    });
  },
};

export = Self;
