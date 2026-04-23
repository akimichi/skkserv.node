import expect = require('expect.js');
const Either = require('kansuu.js').either;

import Interpreter = require('../../lib/datetime/interpreter');

describe('日時インタープリターのテスト', () => {
  describe('キーワード（メソッドなし）', () => {
    it('todayは本日の日付を複数形式で返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("today"), {
        right: (value: any) => {
          expect(Array.isArray(value)).to.eql(true);
          expect(value.length).to.eql(4);
          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, "0");
          const d = String(now.getDate()).padStart(2, "0");
          expect(value[0]).to.eql(`${y}-${m}-${d}`);
          expect(value[1]).to.eql(`${y}/${m}/${d}`);
          // 日本語形式に曜日が含まれることを検証
          expect(value[2]).to.match(/^\d{4}年\d{1,2}月\d{1,2}日\(.\)$/);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });

    it('kyouはtodayと同じ結果を返す', function (next) {
      this.timeout('5s');
      let todayResult: any;
      Either.match(Interpreter.run("today"), {
        right: (value: any) => { todayResult = value; },
        left: (_: any) => { expect().fail(); }
      });
      Either.match(Interpreter.run("kyou"), {
        right: (value: any) => {
          expect(value).to.eql(todayResult);
        },
        left: (_: any) => { expect().fail(); }
      });
      next();
    });

    it('nowは現在時刻を複数形式で返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("now"), {
        right: (value: any) => {
          expect(Array.isArray(value)).to.eql(true);
          expect(value.length).to.eql(3);
          expect(value[0]).to.match(/^\d{2}:\d{2}:\d{2}$/);
          expect(value[1]).to.match(/^\d{1,2}時\d{1,2}分\d{1,2}秒$/);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });

    it('2026は年の複数形式を返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("2026"), {
        right: (value: any) => {
          expect(value[0]).to.eql("2026年");
          expect(value[1]).to.eql("令和8年");
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });

    it('R8は元号年のデフォルト形式を返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("R8"), {
        right: (value: any) => {
          expect(value[0]).to.eql("令和8年");
          expect(value[1]).to.eql("2026年");
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });

    it('2026-10は年月の複数形式を返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("2026-10"), {
        right: (value: any) => {
          expect(value[0]).to.eql("2026年10月");
          expect(value[1]).to.eql("令和8年10月");
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
  });

  describe('メソッド付き', () => {
    it('2026.warekiは和暦変換結果を返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("2026.wareki"), {
        right: (value: any) => {
          expect(value[0]).to.eql("令和8年");
          expect(value[1]).to.eql("R8");
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });

    it('1989.warekiは昭和と平成の両方を返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("1989.wareki"), {
        right: (value: any) => {
          expect(value[0]).to.eql("昭和64年");
          expect(value[1]).to.eql("S64");
          expect(value[2]).to.eql("平成元年");
          expect(value[3]).to.eql("H1");
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });

    it('R8.seirekiは西暦変換結果を返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("R8.seireki"), {
        right: (value: any) => {
          expect(value[0]).to.eql("2026年");
          expect(value[1]).to.eql("2026");
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });

    it('H31.seirekiは2019年を返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("H31.seireki"), {
        right: (value: any) => {
          expect(value[0]).to.eql("2019年");
          expect(value[1]).to.eql("2019");
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });

    it('today.weekdayは曜日を複数形式で返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("today.weekday"), {
        right: (value: any) => {
          expect(Array.isArray(value)).to.eql(true);
          expect(value.length).to.eql(4);
          // 曜日の形式を検証
          expect(value[0]).to.match(/曜日$/);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });

    it('today.monthは月名を複数形式で返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("today.month"), {
        right: (value: any) => {
          expect(Array.isArray(value)).to.eql(true);
          expect(value.length).to.eql(4);
          expect(value[0]).to.match(/月$/);
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });

    it('2026-10.warekiは和暦年月を返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("2026-10.wareki"), {
        right: (value: any) => {
          expect(value[0]).to.eql("令和8年10月");
        },
        left: (_: any) => {
          expect().fail();
        }
      });
      next();
    });
  });

  describe('エラーケース', () => {
    it('未知のキーワードはエラーを返す', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("unknown"), {
        right: (_: any) => {
          expect().fail();
        },
        left: (error: any) => {
          expect(error).to.match(/未知の日時キーワード/);
        }
      });
      next();
    });

    it('時刻型にwarekiメソッドを適用するとエラーになる', function (next) {
      this.timeout('5s');
      Either.match(Interpreter.run("now.wareki"), {
        right: (_: any) => {
          expect().fail();
        },
        left: (error: any) => {
          expect(error).to.match(/時刻型にメソッド/);
        }
      });
      next();
    });
  });
});
