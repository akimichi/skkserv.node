import expect = require('expect.js');
const Pair = require('kansuu.js').pair;
const List = require('kansuu.js').monad.list;

import Exp = require('../../lib/arith/exp');
import Parser = require('../../lib/arith/parser');

// パース結果からExpを取り出すヘルパー
const parseExp = (input: string): any => {
  const result = Parser.parse(Parser.expression)(List.fromString(input));
  return List.match(result, {
    empty: (_: any) => {
      return null;
    },
    cons: (head: any, _: any) => {
      return Pair.match(head, {
        cons: (exp: any, _: any) => {
          return exp;
        }
      });
    }
  });
};

describe('四則演算パーサーのテスト', () => {
  describe('数値リテラルのパース', () => {
    it('整数をパースする', (next) => {
      const exp = parseExp("42");
      Exp.match(exp, {
        num: (value: any) => {
          expect(value).to.eql(42);
        }
      });
      next();
    });
    it('浮動小数点数をパースする', (next) => {
      const exp = parseExp("3.14");
      Exp.match(exp, {
        num: (value: any) => {
          expect(value).to.eql(3.14);
        }
      });
      next();
    });
    it('負の整数をパースする', (next) => {
      const exp = parseExp("-5");
      Exp.match(exp, {
        num: (value: any) => {
          expect(value).to.eql(-5);
        }
      });
      next();
    });
    it('負の浮動小数点数をパースする', (next) => {
      const exp = parseExp("-0.123");
      Exp.match(exp, {
        num: (value: any) => {
          expect(value).to.eql(-0.123);
        }
      });
      next();
    });
  });
  describe('単純な四則演算のパース', () => {
    it('加算をパースする', function (next) {
      this.timeout('5s');
      const exp = parseExp("1 + 2");
      Exp.match(exp, {
        add: (left: any, right: any) => {
          Exp.match(left, {
            num: (v: any) => {
              expect(v).to.eql(1);
            }
          });
          Exp.match(right, {
            num: (v: any) => {
              expect(v).to.eql(2);
            }
          });
        }
      });
      next();
    });
    it('減算をパースする', function (next) {
      this.timeout('5s');
      const exp = parseExp("5 - 3");
      Exp.match(exp, {
        subtract: (left: any, right: any) => {
          Exp.match(left, {
            num: (v: any) => {
              expect(v).to.eql(5);
            }
          });
          Exp.match(right, {
            num: (v: any) => {
              expect(v).to.eql(3);
            }
          });
        }
      });
      next();
    });
    it('乗算をパースする', function (next) {
      this.timeout('5s');
      const exp = parseExp("3 * 4");
      Exp.match(exp, {
        multiply: (left: any, right: any) => {
          Exp.match(left, {
            num: (v: any) => {
              expect(v).to.eql(3);
            }
          });
          Exp.match(right, {
            num: (v: any) => {
              expect(v).to.eql(4);
            }
          });
        }
      });
      next();
    });
    it('除算をパースする', function (next) {
      this.timeout('5s');
      const exp = parseExp("10 / 2");
      Exp.match(exp, {
        divide: (left: any, right: any) => {
          Exp.match(left, {
            num: (v: any) => {
              expect(v).to.eql(10);
            }
          });
          Exp.match(right, {
            num: (v: any) => {
              expect(v).to.eql(2);
            }
          });
        }
      });
      next();
    });
  });
  describe('演算子の優先順位', () => {
    it('乗算は加算より優先される', function (next) {
      this.timeout('5s');
      // 1 + 2 * 3 → add(num(1), multiply(num(2), num(3)))
      const exp = parseExp("1 + 2 * 3");
      Exp.match(exp, {
        add: (left: any, right: any) => {
          Exp.match(left, {
            num: (v: any) => {
              expect(v).to.eql(1);
            }
          });
          Exp.match(right, {
            multiply: (ml: any, mr: any) => {
              Exp.match(ml, {
                num: (v: any) => {
                  expect(v).to.eql(2);
                }
              });
              Exp.match(mr, {
                num: (v: any) => {
                  expect(v).to.eql(3);
                }
              });
            }
          });
        }
      });
      next();
    });
    it('除算は減算より優先される', function (next) {
      this.timeout('5s');
      // 10 - 6 / 2 → subtract(num(10), divide(num(6), num(2)))
      const exp = parseExp("10 - 6 / 2");
      Exp.match(exp, {
        subtract: (left: any, right: any) => {
          Exp.match(left, {
            num: (v: any) => {
              expect(v).to.eql(10);
            }
          });
          Exp.match(right, {
            divide: (dl: any, dr: any) => {
              Exp.match(dl, {
                num: (v: any) => {
                  expect(v).to.eql(6);
                }
              });
              Exp.match(dr, {
                num: (v: any) => {
                  expect(v).to.eql(2);
                }
              });
            }
          });
        }
      });
      next();
    });
  });
  describe('左結合のテスト', () => {
    it('減算は左結合である', function (next) {
      this.timeout('5s');
      // 1 - 2 - 3 → subtract(subtract(num(1), num(2)), num(3))
      const exp = parseExp("1 - 2 - 3");
      Exp.match(exp, {
        subtract: (left: any, right: any) => {
          Exp.match(left, {
            subtract: (ll: any, lr: any) => {
              Exp.match(ll, {
                num: (v: any) => {
                  expect(v).to.eql(1);
                }
              });
              Exp.match(lr, {
                num: (v: any) => {
                  expect(v).to.eql(2);
                }
              });
            }
          });
          Exp.match(right, {
            num: (v: any) => {
              expect(v).to.eql(3);
            }
          });
        }
      });
      next();
    });
  });
  describe('括弧のテスト', () => {
    it('括弧で優先順位を変更する', function (next) {
      this.timeout('5s');
      // (1 + 2) * 3 → multiply(add(num(1), num(2)), num(3))
      const exp = parseExp("(1 + 2) * 3");
      Exp.match(exp, {
        multiply: (left: any, right: any) => {
          Exp.match(left, {
            add: (al: any, ar: any) => {
              Exp.match(al, {
                num: (v: any) => {
                  expect(v).to.eql(1);
                }
              });
              Exp.match(ar, {
                num: (v: any) => {
                  expect(v).to.eql(2);
                }
              });
            }
          });
          Exp.match(right, {
            num: (v: any) => {
              expect(v).to.eql(3);
            }
          });
        }
      });
      next();
    });
    it('ネストした括弧をパースする', function (next) {
      this.timeout('5s');
      const exp = parseExp("((1 + 2))");
      Exp.match(exp, {
        add: (left: any, right: any) => {
          Exp.match(left, {
            num: (v: any) => {
              expect(v).to.eql(1);
            }
          });
          Exp.match(right, {
            num: (v: any) => {
              expect(v).to.eql(2);
            }
          });
        }
      });
      next();
    });
  });
  describe('空白の処理', () => {
    it('余分な空白を無視する', function (next) {
      this.timeout('5s');
      const exp = parseExp("  1  +  2  ");
      Exp.match(exp, {
        add: (left: any, right: any) => {
          Exp.match(left, {
            num: (v: any) => {
              expect(v).to.eql(1);
            }
          });
          Exp.match(right, {
            num: (v: any) => {
              expect(v).to.eql(2);
            }
          });
        }
      });
      next();
    });
  });
  describe('浮動小数点を含む式', () => {
    it('浮動小数点の加算をパースする', function (next) {
      this.timeout('5s');
      const exp = parseExp("1.5 + 2.5");
      Exp.match(exp, {
        add: (left: any, right: any) => {
          Exp.match(left, {
            num: (v: any) => {
              expect(v).to.eql(1.5);
            }
          });
          Exp.match(right, {
            num: (v: any) => {
              expect(v).to.eql(2.5);
            }
          });
        }
      });
      next();
    });
  });
});
