import Exp = require('./exp');
import Era = require('./era');
const M = require('kansuu.js').monad.either;

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAYS_EN_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_EN_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS_EN_FULL = ["", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const MONTHS_EN_SHORT = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_JA_OLD = ["", "睦月", "如月", "弥生", "卯月", "皐月", "水無月",
  "文月", "葉月", "長月", "神無月", "霜月", "師走"];

const pad2 = (n: number): string => String(n).padStart(2, "0");

const weekdayStr = (year: number, month: number, day: number): string => {
  const d = new Date(year, month - 1, day);
  return WEEKDAYS_JA[d.getDay()];
};

const formatDateDefault = (year: number, month: number, day: number): string[] => {
  const w = weekdayStr(year, month, day);
  const warekiResults = Era.toWarekiFromDate(year, month, day);
  const warekiDateStr = warekiResults.length > 0
    ? `${warekiResults[0].replace("年", `年${month}月${day}日`)}(${w})`
    : null;
  const result = [
    `${year}-${pad2(month)}-${pad2(day)}`,
    `${year}/${pad2(month)}/${pad2(day)}`,
    `${year}年${month}月${day}日(${w})`,
  ];
  if (warekiDateStr) {
    result.push(warekiDateStr);
  }
  return result;
};

const formatTimeDefault = (): string[] => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ampm = h < 12 ? "午前" : "午後";
  const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
  return [
    `${pad2(h)}:${pad2(m)}:${pad2(s)}`,
    `${h}時${m}分${s}秒`,
    `${ampm}${h12}時${m}分`,
  ];
};

const formatYearDefault = (year: number): string[] => {
  const wareki = Era.toWarekiFromYear(year);
  const result = [`${year}年`];
  if (wareki.length > 0) {
    // 和暦の「〜年」形式のみ追加（短縮形は除く）
    for (const w of wareki) {
      if (w.endsWith("年")) {
        result.push(w);
      }
    }
  }
  return result;
};

const formatYearMonthDefault = (year: number, month: number): string[] => {
  const wareki = Era.toWarekiFromYearMonth(year, month);
  const result = [`${year}年${month}月`];
  for (const w of wareki) {
    result.push(w);
  }
  return result;
};

const formatEraYearDefault = (prefix: string, eraYearNum: number): string[] => {
  const era = Era.findEraByPrefix(prefix);
  if (!era) {
    return [];
  }
  const westernYear = era.startYear + eraYearNum - 1;
  const yearStr = eraYearNum === 1 ? "元" : String(eraYearNum);
  return [
    `${era.name}${yearStr}年`,
    `${westernYear}年`,
  ];
};

const evaluate = (anExp: any): any => {
  return Exp.match(anExp, {
    date: (year: number, month: number, day: number) => {
      return M.unit(formatDateDefault(year, month, day));
    },
    yearMonth: (year: number, month: number) => {
      return M.unit(formatYearMonthDefault(year, month));
    },
    year: (value: number) => {
      return M.unit(formatYearDefault(value));
    },
    eraYear: (prefix: string, eraYearNum: number) => {
      const result = formatEraYearDefault(prefix, eraYearNum);
      if (result.length === 0) {
        return M.left(`元号の形式が不正です: ${prefix}${eraYearNum}`);
      }
      return M.unit(result);
    },
    time: () => {
      return M.unit(formatTimeDefault());
    },
    methodCall: (primary: any, method: string) => {
      return evaluateMethod(primary, method);
    },
  });
};

const evaluateMethod = (primary: any, method: string): any => {
  return Exp.match(primary, {
    date: (year: number, month: number, day: number) => {
      switch (method) {
        case "wareki": {
          const w = weekdayStr(year, month, day);
          const wareki = Era.toWarekiFromDate(year, month, day);
          if (wareki.length === 0) {
            return M.left("明治以前の元号には対応していません");
          }
          return M.unit([`${wareki[0].replace("年", `年${month}月${day}日`)}(${w})`]);
        }
        case "weekday": {
          const d = new Date(year, month - 1, day);
          const dow = d.getDay();
          return M.unit([
            `${WEEKDAYS_JA[dow]}曜日`,
            WEEKDAYS_JA[dow],
            WEEKDAYS_EN_FULL[dow],
            WEEKDAYS_EN_SHORT[dow],
          ]);
        }
        case "month": {
          return M.unit([
            `${month}月`,
            MONTHS_EN_FULL[month],
            MONTHS_EN_SHORT[month],
            MONTHS_JA_OLD[month],
          ]);
        }
        default:
          return M.left(`日付型にメソッド「${method}」は適用できません`);
      }
    },
    yearMonth: (year: number, month: number) => {
      switch (method) {
        case "wareki": {
          const result = Era.toWarekiFromYearMonth(year, month);
          if (result.length === 0) {
            return M.left("明治以前の元号には対応していません");
          }
          return M.unit(result);
        }
        case "month": {
          return M.unit([
            `${month}月`,
            MONTHS_EN_FULL[month],
            MONTHS_EN_SHORT[month],
            MONTHS_JA_OLD[month],
          ]);
        }
        default:
          return M.left(`年月型にメソッド「${method}」は適用できません`);
      }
    },
    year: (value: number) => {
      switch (method) {
        case "wareki": {
          const result = Era.toWarekiFromYear(value);
          if (result.length === 0) {
            return M.left("明治以前の元号には対応していません");
          }
          return M.unit(result);
        }
        default:
          return M.left(`年型にメソッド「${method}」は適用できません`);
      }
    },
    eraYear: (prefix: string, eraYearNum: number) => {
      switch (method) {
        case "seireki": {
          const westernYear = Era.fromWareki(prefix, eraYearNum);
          if (westernYear === null) {
            return M.left(`元号の形式が不正です: ${prefix}${eraYearNum}`);
          }
          return M.unit([`${westernYear}年`, String(westernYear)]);
        }
        default:
          return M.left(`元号年型にメソッド「${method}」は適用できません`);
      }
    },
    time: () => {
      return M.left(`時刻型にメソッド「${method}」は適用できません`);
    },
  });
};

export = evaluate;
