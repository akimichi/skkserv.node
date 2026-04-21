import Exp = require('./exp');
const M = require('kansuu.js').monad.either;

const evaluate = (anExp: any): any => {
  return Exp.match(anExp, {
    num: (value: number) => {
      return M.unit(value);
    },
    add: (left: any, right: any) => {
      return M.flatMap(evaluate(left))((l: number) => {
        return M.flatMap(evaluate(right))((r: number) => {
          return M.unit(l + r);
        });
      });
    },
    subtract: (left: any, right: any) => {
      return M.flatMap(evaluate(left))((l: number) => {
        return M.flatMap(evaluate(right))((r: number) => {
          return M.unit(l - r);
        });
      });
    },
    multiply: (left: any, right: any) => {
      return M.flatMap(evaluate(left))((l: number) => {
        return M.flatMap(evaluate(right))((r: number) => {
          return M.unit(l * r);
        });
      });
    },
    divide: (left: any, right: any) => {
      return M.flatMap(evaluate(left))((l: number) => {
        return M.flatMap(evaluate(right))((r: number) => {
          if (r === 0) {
            return M.left("ゼロで割ることはできません");
          }
          return M.unit(l / r);
        });
      });
    }
  });
};

export = evaluate;
