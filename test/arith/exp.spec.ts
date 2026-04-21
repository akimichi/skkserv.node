import expect = require('expect.js');
import Exp = require('../../lib/arith/exp');

describe('四則演算の式のテスト', () => {
  describe('数値の式のテスト', () => {
    it('整数の式を作る', (next) => {
      const num = Exp.num(42);
      Exp.match(num, {
        num: (value) => {
          expect(value).to.eql(42);
        }
      });
      next();
    });
    it('浮動小数点の式を作る', (next) => {
      const num = Exp.num(3.14);
      Exp.match(num, {
        num: (value) => {
          expect(value).to.eql(3.14);
        }
      });
      next();
    });
    it('負の数の式を作る', (next) => {
      const num = Exp.num(-5);
      Exp.match(num, {
        num: (value) => {
          expect(value).to.eql(-5);
        }
      });
      next();
    });
  });
  describe('加算の式のテスト', () => {
    it('addの式を作る', (next) => {
      const addExpr = Exp.add(Exp.num(1), Exp.num(2));
      Exp.match(addExpr, {
        add: (left, right) => {
          Exp.match(left, {
            num: (v) => {
              expect(v).to.eql(1);
            }
          });
          Exp.match(right, {
            num: (v) => {
              expect(v).to.eql(2);
            }
          });
        }
      });
      next();
    });
  });
  describe('減算の式のテスト', () => {
    it('subtractの式を作る', (next) => {
      const subExpr = Exp.subtract(Exp.num(5), Exp.num(3));
      Exp.match(subExpr, {
        subtract: (left, right) => {
          Exp.match(left, {
            num: (v) => {
              expect(v).to.eql(5);
            }
          });
          Exp.match(right, {
            num: (v) => {
              expect(v).to.eql(3);
            }
          });
        }
      });
      next();
    });
  });
  describe('乗算の式のテスト', () => {
    it('multiplyの式を作る', (next) => {
      const mulExpr = Exp.multiply(Exp.num(3), Exp.num(4));
      Exp.match(mulExpr, {
        multiply: (left, right) => {
          Exp.match(left, {
            num: (v) => {
              expect(v).to.eql(3);
            }
          });
          Exp.match(right, {
            num: (v) => {
              expect(v).to.eql(4);
            }
          });
        }
      });
      next();
    });
  });
  describe('除算の式のテスト', () => {
    it('divideの式を作る', (next) => {
      const divExpr = Exp.divide(Exp.num(10), Exp.num(2));
      Exp.match(divExpr, {
        divide: (left, right) => {
          Exp.match(left, {
            num: (v) => {
              expect(v).to.eql(10);
            }
          });
          Exp.match(right, {
            num: (v) => {
              expect(v).to.eql(2);
            }
          });
        }
      });
      next();
    });
  });
  describe('ネストした式のテスト', () => {
    it('1 + 2 * 3 に対応する式を作る', (next) => {
      const expr = Exp.add(Exp.num(1), Exp.multiply(Exp.num(2), Exp.num(3)));
      Exp.match(expr, {
        add: (left, right) => {
          Exp.match(left, {
            num: (v) => {
              expect(v).to.eql(1);
            }
          });
          Exp.match(right, {
            multiply: (ml, mr) => {
              Exp.match(ml, {
                num: (v) => {
                  expect(v).to.eql(2);
                }
              });
              Exp.match(mr, {
                num: (v) => {
                  expect(v).to.eql(3);
                }
              });
            }
          });
        }
      });
      next();
    });
  });
});
