import expect = require('expect.js');
import Era = require('../../lib/datetime/era');

describe('元号変換のテスト', () => {
  describe('eraForDate', () => {
    it('令和の日付を正しく判定する', () => {
      const era = Era.eraForDate(2026, 4, 23);
      expect(era).to.be.ok();
      expect(era!.name).to.eql("令和");
    });
    it('令和の開始日を正しく判定する', () => {
      const era = Era.eraForDate(2019, 5, 1);
      expect(era!.name).to.eql("令和");
    });
    it('平成の最終日を正しく判定する', () => {
      const era = Era.eraForDate(2019, 4, 30);
      expect(era!.name).to.eql("平成");
    });
    it('昭和の最終日を正しく判定する', () => {
      const era = Era.eraForDate(1989, 1, 7);
      expect(era!.name).to.eql("昭和");
    });
    it('平成の開始日を正しく判定する', () => {
      const era = Era.eraForDate(1989, 1, 8);
      expect(era!.name).to.eql("平成");
    });
    it('明治以前はnullを返す', () => {
      const era = Era.eraForDate(1867, 12, 31);
      expect(era).to.eql(null);
    });
  });

  describe('toWarekiFromYear', () => {
    it('2026年を令和8年に変換する', () => {
      const result = Era.toWarekiFromYear(2026);
      expect(result).to.eql(["令和8年", "R8"]);
    });
    it('2019年は平成31年と令和元年の両方を返す', () => {
      const result = Era.toWarekiFromYear(2019);
      expect(result).to.eql(["平成31年", "H31", "令和元年", "R1"]);
    });
    it('1989年は昭和64年と平成元年の両方を返す', () => {
      const result = Era.toWarekiFromYear(1989);
      expect(result).to.eql(["昭和64年", "S64", "平成元年", "H1"]);
    });
    it('元年は「元年」と表記する', () => {
      const result = Era.toWarekiFromYear(1926);
      expect(result.indexOf("昭和元年") >= 0).to.eql(true);
      expect(result.indexOf("S1") >= 0).to.eql(true);
    });
  });

  describe('toWarekiFromYearMonth', () => {
    it('2026年10月を令和8年10月に変換する', () => {
      const result = Era.toWarekiFromYearMonth(2026, 10);
      expect(result).to.eql(["令和8年10月"]);
    });
    it('1989年の年月は昭和と平成の両方を返す', () => {
      const result = Era.toWarekiFromYearMonth(1989, 3);
      expect(result).to.eql(["昭和64年3月", "平成元年3月"]);
    });
  });

  describe('toWarekiFromDate', () => {
    it('2026-04-23を令和8年に変換する', () => {
      const result = Era.toWarekiFromDate(2026, 4, 23);
      expect(result).to.eql(["令和8年"]);
    });
    it('1989-01-07は昭和64年を返す', () => {
      const result = Era.toWarekiFromDate(1989, 1, 7);
      expect(result).to.eql(["昭和64年"]);
    });
    it('1989-01-08は平成元年を返す', () => {
      const result = Era.toWarekiFromDate(1989, 1, 8);
      expect(result).to.eql(["平成元年"]);
    });
  });

  describe('fromWareki', () => {
    it('R8を2026に変換する', () => {
      expect(Era.fromWareki("R", 8)).to.eql(2026);
    });
    it('H31を2019に変換する', () => {
      expect(Era.fromWareki("H", 31)).to.eql(2019);
    });
    it('S1を1926に変換する', () => {
      expect(Era.fromWareki("S", 1)).to.eql(1926);
    });
    it('不正なprefixはnullを返す', () => {
      expect(Era.fromWareki("X", 1)).to.eql(null);
    });
  });
});
