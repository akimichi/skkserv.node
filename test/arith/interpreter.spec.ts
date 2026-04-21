import expect = require('expect.js');
const Either = require('kansuu.js').either;

import Exp = require('../../lib/arith/exp');
import Interpreter = require('../../lib/arith/interpreter');

describe('四則演算インタープリターのテスト', () => {
  describe('compile', () => {
    it('加算式をコンパイルする', function (next) {
      this.timeout('5s');
      const exp = Interpreter.compile("1 + 2");
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
    it('優先順位を反映したASTを生成する', function (next) {
      this.timeout('5s');
      const exp = Interpreter.compile("1 + 2 * 3");
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
  });
  describe('run', () => {
    describe('基本的な四則演算', () => {
      it('加算: 1 + 2 = 3', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("1 + 2"), {
          right: (value: any) => {
            expect(value).to.eql(3);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
      it('減算: 10 - 3 = 7', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("10 - 3"), {
          right: (value: any) => {
            expect(value).to.eql(7);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
      it('乗算: 4 * 5 = 20', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("4 * 5"), {
          right: (value: any) => {
            expect(value).to.eql(20);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
      it('除算: 20 / 4 = 5', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("20 / 4"), {
          right: (value: any) => {
            expect(value).to.eql(5);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
    });
    describe('演算子の優先順位', () => {
      it('1 + 2 * 3 = 7', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("1 + 2 * 3"), {
          right: (value: any) => {
            expect(value).to.eql(7);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
      it('10 - 6 / 2 = 7', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("10 - 6 / 2"), {
          right: (value: any) => {
            expect(value).to.eql(7);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
    });
    describe('括弧による優先順位の変更', () => {
      it('(1 + 2) * 3 = 9', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(1 + 2) * 3"), {
          right: (value: any) => {
            expect(value).to.eql(9);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
      it('(10 - 4) / 2 = 3', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(10 - 4) / 2"), {
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
    describe('左結合', () => {
      it('10 - 3 - 2 = 5', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("10 - 3 - 2"), {
          right: (value: any) => {
            expect(value).to.eql(5);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
      it('20 / 2 / 5 = 2', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("20 / 2 / 5"), {
          right: (value: any) => {
            expect(value).to.eql(2);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
    });
    describe('浮動小数点と負の数', () => {
      it('1.5 + 2.5 = 4', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("1.5 + 2.5"), {
          right: (value: any) => {
            expect(value).to.eql(4);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
      it('数値のみの評価: 42', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("42"), {
          right: (value: any) => {
            expect(value).to.eql(42);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
    });
    describe('複雑な式', () => {
      it('(1 + 2) * (3 + 4) = 21', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("(1 + 2) * (3 + 4)"), {
          right: (value: any) => {
            expect(value).to.eql(21);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
      it('2 * 3 + 4 * 5 = 26', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("2 * 3 + 4 * 5"), {
          right: (value: any) => {
            expect(value).to.eql(26);
          },
          left: (_: any) => {
            expect().fail();
          }
        });
        next();
      });
    });
    describe('エラーケース', () => {
      it('ゼロ除算はエラーになる', function (next) {
        this.timeout('5s');
        Either.match(Interpreter.run("1 / 0"), {
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
  });
});
