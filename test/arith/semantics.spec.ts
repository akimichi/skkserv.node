import expect = require('expect.js');
const Either = require('kansuu.js').either;

import Exp = require('../../lib/arith/exp');
import evaluate = require('../../lib/arith/semantics');

describe('四則演算の評価のテスト', () => {
  describe('数値の評価', () => {
    it('整数を評価する', (next) => {
      Either.match(evaluate(Exp.num(42)), {
        right: (value: any) => {
          expect(value).to.eql(42);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
    it('浮動小数点数を評価する', (next) => {
      Either.match(evaluate(Exp.num(3.14)), {
        right: (value: any) => {
          expect(value).to.eql(3.14);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
    it('負の数を評価する', (next) => {
      Either.match(evaluate(Exp.num(-5)), {
        right: (value: any) => {
          expect(value).to.eql(-5);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
  });
  describe('加算の評価', () => {
    it('1 + 2 = 3', (next) => {
      Either.match(evaluate(Exp.add(Exp.num(1), Exp.num(2))), {
        right: (value: any) => {
          expect(value).to.eql(3);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
  });
  describe('減算の評価', () => {
    it('5 - 3 = 2', (next) => {
      Either.match(evaluate(Exp.subtract(Exp.num(5), Exp.num(3))), {
        right: (value: any) => {
          expect(value).to.eql(2);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
    it('負の結果: 3 - 5 = -2', (next) => {
      Either.match(evaluate(Exp.subtract(Exp.num(3), Exp.num(5))), {
        right: (value: any) => {
          expect(value).to.eql(-2);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
  });
  describe('乗算の評価', () => {
    it('3 * 4 = 12', (next) => {
      Either.match(evaluate(Exp.multiply(Exp.num(3), Exp.num(4))), {
        right: (value: any) => {
          expect(value).to.eql(12);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
    it('ゼロとの乗算: 0 * 100 = 0', (next) => {
      Either.match(evaluate(Exp.multiply(Exp.num(0), Exp.num(100))), {
        right: (value: any) => {
          expect(value).to.eql(0);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
  });
  describe('除算の評価', () => {
    it('10 / 2 = 5', (next) => {
      Either.match(evaluate(Exp.divide(Exp.num(10), Exp.num(2))), {
        right: (value: any) => {
          expect(value).to.eql(5);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
    it('割り切れない除算: 7 / 2 = 3.5', (next) => {
      Either.match(evaluate(Exp.divide(Exp.num(7), Exp.num(2))), {
        right: (value: any) => {
          expect(value).to.eql(3.5);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
    it('ゼロ除算はエラーになる', (next) => {
      Either.match(evaluate(Exp.divide(Exp.num(1), Exp.num(0))), {
        right: (_: any) => {
          expect().fail();
        },
        left: (error: any) => {
          expect(error).to.eql("ゼロで割ることはできません");
        }
      });
      next();
    });
  });
  describe('ネストした式の評価', () => {
    it('1 + 2 * 3 = 7', (next) => {
      // add(num(1), multiply(num(2), num(3)))
      Either.match(evaluate(Exp.add(Exp.num(1), Exp.multiply(Exp.num(2), Exp.num(3)))), {
        right: (value: any) => {
          expect(value).to.eql(7);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
    it('(1 + 2) * (10 - 4) = 18', (next) => {
      // multiply(add(num(1), num(2)), subtract(num(10), num(4)))
      Either.match(evaluate(Exp.multiply(Exp.add(Exp.num(1), Exp.num(2)), Exp.subtract(Exp.num(10), Exp.num(4)))), {
        right: (value: any) => {
          expect(value).to.eql(18);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
  });
});
