import expect = require('expect.js');
const Pair = require('kansuu.js').pair;
const List = require('kansuu.js').monad.list;

import Exp = require('../../lib/datetime/exp');
import Parser = require('../../lib/datetime/parser');

const parseAndGet = (parser: any, input: string): any => {
  const result = Parser.parse(parser)(List.fromString(input));
  return List.match(result, {
    empty: (_: any) => null,
    cons: (head: any, _: any) => {
      return Pair.match(head, {
        cons: (v: any, rest: any) => v
      });
    }
  });
};

describe('日時パーサーのテスト', () => {
  describe('primary', () => {
    it('todayをパースする', () => {
      const exp = parseAndGet(Parser.primary, "today");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        date: (y: number, m: number, d: number) => {
          const now = new Date();
          expect(y).to.eql(now.getFullYear());
          expect(m).to.eql(now.getMonth() + 1);
          expect(d).to.eql(now.getDate());
        }
      });
    });

    it('nowをパースする', () => {
      const exp = parseAndGet(Parser.primary, "now");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        time: () => {
          expect(true).to.eql(true);
        }
      });
    });

    it('kyouをパースする（todayと同じ結果）', () => {
      const exp = parseAndGet(Parser.primary, "kyou");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        date: (y: number, m: number, d: number) => {
          const now = new Date();
          expect(y).to.eql(now.getFullYear());
        }
      });
    });

    it('R8をパースする', () => {
      const exp = parseAndGet(Parser.primary, "R8");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        eraYear: (prefix: string, num: number) => {
          expect(prefix).to.eql("R");
          expect(num).to.eql(8);
        }
      });
    });

    it('H31をパースする', () => {
      const exp = parseAndGet(Parser.primary, "H31");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        eraYear: (prefix: string, num: number) => {
          expect(prefix).to.eql("H");
          expect(num).to.eql(31);
        }
      });
    });

    it('2026-04-23をパースする', () => {
      const exp = parseAndGet(Parser.primary, "2026-04-23");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        date: (y: number, m: number, d: number) => {
          expect(y).to.eql(2026);
          expect(m).to.eql(4);
          expect(d).to.eql(23);
        }
      });
    });

    it('2026-10をパースする', () => {
      const exp = parseAndGet(Parser.primary, "2026-10");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        yearMonth: (y: number, m: number) => {
          expect(y).to.eql(2026);
          expect(m).to.eql(10);
        }
      });
    });

    it('2026をパースする', () => {
      const exp = parseAndGet(Parser.primary, "2026");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        year: (v: number) => {
          expect(v).to.eql(2026);
        }
      });
    });
  });

  describe('expression（メソッド付き）', () => {
    it('today.warekiをパースする', () => {
      const exp = parseAndGet(Parser.expression, "today.wareki");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        methodCall: (primary: any, method: string) => {
          expect(method).to.eql("wareki");
          Exp.match(primary, {
            date: (y: number, m: number, d: number) => {
              const now = new Date();
              expect(y).to.eql(now.getFullYear());
            }
          });
        }
      });
    });

    it('2026.warekiをパースする', () => {
      const exp = parseAndGet(Parser.expression, "2026.wareki");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        methodCall: (primary: any, method: string) => {
          expect(method).to.eql("wareki");
          Exp.match(primary, {
            year: (v: number) => {
              expect(v).to.eql(2026);
            }
          });
        }
      });
    });

    it('R8.seirekiをパースする', () => {
      const exp = parseAndGet(Parser.expression, "R8.seireki");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        methodCall: (primary: any, method: string) => {
          expect(method).to.eql("seireki");
          Exp.match(primary, {
            eraYear: (prefix: string, num: number) => {
              expect(prefix).to.eql("R");
              expect(num).to.eql(8);
            }
          });
        }
      });
    });

    it('today.weekdayをパースする', () => {
      const exp = parseAndGet(Parser.expression, "today.weekday");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        methodCall: (primary: any, method: string) => {
          expect(method).to.eql("weekday");
        }
      });
    });

    it('2026-10.warekiをパースする', () => {
      const exp = parseAndGet(Parser.expression, "2026-10.wareki");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        methodCall: (primary: any, method: string) => {
          expect(method).to.eql("wareki");
          Exp.match(primary, {
            yearMonth: (y: number, m: number) => {
              expect(y).to.eql(2026);
              expect(m).to.eql(10);
            }
          });
        }
      });
    });

    it('メソッドなしのtodayはそのままdate型を返す', () => {
      const exp = parseAndGet(Parser.expression, "today");
      expect(exp).to.be.ok();
      Exp.match(exp, {
        date: (y: number, m: number, d: number) => {
          const now = new Date();
          expect(y).to.eql(now.getFullYear());
        }
      });
    });
  });
});
