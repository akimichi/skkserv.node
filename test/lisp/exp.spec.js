'use strict';

const expect = require('expect.js'),
  env = require('../../lib/lisp/env.js'),
  ID = require('kansuu.js').monad.identity;
const Exp = require('../../lib/lisp/exp.js');

describe('式のテスト', () => {
  describe('数値の式のテスト', () => {
    it('数値の式を作る', (next) => {
      const number = Exp.atom(1);
      Exp.match(number, {
        atom: (value) => {
          expect(value).to.eql(1);
        }
      });
      next();
    });
  });
  describe('lambdaの式のテスト', () => {
    it('lambdaの式を作る', (next) => {
      const lambdaExpression = Exp.lambda(Exp.variable('x'), Exp.variable('x'));
      Exp.match(lambdaExpression, {
        lambda: (arg, body) => {
          Exp.match(arg, {
            variable: (name) => {
              expect(name).to.eql('x');
            }
          })
        }
      });
      next();
    });
  });
  describe('variableの式のテスト', () => {
    it('variableの式を作る', (next) => {
      const varExpr = Exp.variable('x');
      Exp.match(varExpr, {
        variable: (name) => {
          expect(name).to.eql('x');
        }
      });
      next();
    });
  });
  describe('appの式のテスト', () => {
    it('appの式を作る', (next) => {
      const x = Exp.variable("x");
      const id = Exp.lambda(x, x);
      const appExpr = Exp.app(id, Exp.atom(1));
      Exp.match(appExpr, {
        app: (operator, operand) => {
          Exp.match(operand, {
            atom: (value) => {
              expect(value).to.eql(1);
            }
          });
        }
      });
      next();
    });
  });
  describe('算術式のテスト', () => {
    it('addの式を作る', (next) => {
      const addExpr = Exp.add(Exp.atom(1), Exp.atom(2));
      Exp.match(addExpr, {
        add: (left, right) => {
          Exp.match(left, {
            atom: (v) => {
              expect(v).to.eql(1);
            }
          });
          Exp.match(right, {
            atom: (v) => {
              expect(v).to.eql(2);
            }
          });
        }
      });
      next();
    });
    it('subtractの式を作る', (next) => {
      const subExpr = Exp.subtract(Exp.atom(5), Exp.atom(3));
      Exp.match(subExpr, {
        subtract: (left, right) => {
          Exp.match(left, {
            atom: (v) => {
              expect(v).to.eql(5);
            }
          });
          Exp.match(right, {
            atom: (v) => {
              expect(v).to.eql(3);
            }
          });
        }
      });
      next();
    });
    it('multiplyの式を作る', (next) => {
      const mulExpr = Exp.multiply(Exp.atom(3), Exp.atom(4));
      Exp.match(mulExpr, {
        multiply: (left, right) => {
          Exp.match(left, {
            atom: (v) => {
              expect(v).to.eql(3);
            }
          });
          Exp.match(right, {
            atom: (v) => {
              expect(v).to.eql(4);
            }
          });
        }
      });
      next();
    });
    it('divideの式を作る', (next) => {
      const divExpr = Exp.divide(Exp.atom(10), Exp.atom(2));
      Exp.match(divExpr, {
        divide: (left, right) => {
          Exp.match(left, {
            atom: (v) => {
              expect(v).to.eql(10);
            }
          });
          Exp.match(right, {
            atom: (v) => {
              expect(v).to.eql(2);
            }
          });
        }
      });
      next();
    });
    it('exptの式を作る', (next) => {
      const exptExpr = Exp.expt(Exp.atom(2), Exp.atom(3));
      Exp.match(exptExpr, {
        expt: (base, exp) => {
          Exp.match(base, {
            atom: (v) => {
              expect(v).to.eql(2);
            }
          });
          Exp.match(exp, {
            atom: (v) => {
              expect(v).to.eql(3);
            }
          });
        }
      });
      next();
    });
  });
  describe('ifExprの式のテスト', () => {
    it('ifExprの式を作る', (next) => {
      const ifExpr = Exp.ifExpr(Exp.atom(true), Exp.atom(1), Exp.atom(0));
      Exp.match(ifExpr, {
        ifExpr: (predicate, consequent, alternative) => {
          Exp.match(predicate, {
            atom: (v) => {
              expect(v).to.eql(true);
            }
          });
          Exp.match(consequent, {
            atom: (v) => {
              expect(v).to.eql(1);
            }
          });
          Exp.match(alternative, {
            atom: (v) => {
              expect(v).to.eql(0);
            }
          });
        }
      });
      next();
    });
  });
  describe('isEqualの式のテスト', () => {
    it('isEqualの式を作る', (next) => {
      const eqExpr = Exp.isEqual(Exp.atom(1), Exp.atom(1));
      Exp.match(eqExpr, {
        isEqual: (left, right) => {
          Exp.match(left, {
            atom: (v) => {
              expect(v).to.eql(1);
            }
          });
          Exp.match(right, {
            atom: (v) => {
              expect(v).to.eql(1);
            }
          });
        }
      });
      next();
    });
  });
  describe('論理式のテスト', () => {
    it('andの式を作る', (next) => {
      const andExpr = Exp.and(Exp.atom(true), Exp.atom(false));
      Exp.match(andExpr, {
        and: (left, right) => {
          Exp.match(left, {
            atom: (v) => {
              expect(v).to.eql(true);
            }
          });
          Exp.match(right, {
            atom: (v) => {
              expect(v).to.eql(false);
            }
          });
        }
      });
      next();
    });
    it('orの式を作る', (next) => {
      const orExpr = Exp.or(Exp.atom(false), Exp.atom(true));
      Exp.match(orExpr, {
        or: (left, right) => {
          Exp.match(left, {
            atom: (v) => {
              expect(v).to.eql(false);
            }
          });
          Exp.match(right, {
            atom: (v) => {
              expect(v).to.eql(true);
            }
          });
        }
      });
      next();
    });
    it('notの式を作る', (next) => {
      const notExpr = Exp.not(Exp.atom(true));
      Exp.match(notExpr, {
        not: (exp) => {
          Exp.match(exp, {
            atom: (v) => {
              expect(v).to.eql(true);
            }
          });
        }
      });
      next();
    });
  });
  describe('リスト式のテスト', () => {
    it('consの式を作る', (next) => {
      const consExpr = Exp.cons(Exp.atom(1), Exp.nil());
      Exp.match(consExpr, {
        cons: (head, tail) => {
          Exp.match(head, {
            atom: (v) => {
              expect(v).to.eql(1);
            }
          });
          Exp.match(tail, {
            nil: () => {
              expect(true).to.eql(true);
            }
          });
        }
      });
      next();
    });
    it('nilの式を作る', (next) => {
      const nilExpr = Exp.nil();
      Exp.match(nilExpr, {
        nil: () => {
          expect(true).to.eql(true);
        }
      });
      next();
    });
  });
});
