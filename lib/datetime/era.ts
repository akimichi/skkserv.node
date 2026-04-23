interface Era {
  name: string;
  prefix: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
}

const ERAS: Era[] = [
  { name: "明治", prefix: "M", startYear: 1868, startMonth: 1, startDay: 25, endYear: 1912, endMonth: 7, endDay: 29 },
  { name: "大正", prefix: "T", startYear: 1912, startMonth: 7, startDay: 30, endYear: 1926, endMonth: 12, endDay: 24 },
  { name: "昭和", prefix: "S", startYear: 1926, startMonth: 12, startDay: 25, endYear: 1989, endMonth: 1, endDay: 7 },
  { name: "平成", prefix: "H", startYear: 1989, startMonth: 1, startDay: 8, endYear: 2019, endMonth: 4, endDay: 30 },
  { name: "令和", prefix: "R", startYear: 2019, startMonth: 5, startDay: 1, endYear: 9999, endMonth: 12, endDay: 31 },
];

const toDateNum = (year: number, month: number, day: number): number => {
  return year * 10000 + month * 100 + day;
};

const eraForDate = (year: number, month: number, day: number): Era | null => {
  const dateNum = toDateNum(year, month, day);
  for (let i = ERAS.length - 1; i >= 0; i--) {
    const era = ERAS[i];
    if (dateNum >= toDateNum(era.startYear, era.startMonth, era.startDay)) {
      return era;
    }
  }
  return null;
};

const erasForYear = (year: number): Era[] => {
  return ERAS.filter((era) => {
    return year >= era.startYear && year <= era.endYear;
  });
};

const formatEraYear = (era: Era, year: number): string => {
  const eraYear = year - era.startYear + 1;
  const yearStr = eraYear === 1 ? "元" : String(eraYear);
  return `${era.name}${yearStr}年`;
};

const formatEraYearShort = (era: Era, year: number): string => {
  const eraYear = year - era.startYear + 1;
  return `${era.prefix}${eraYear}`;
};

const toWarekiFromDate = (year: number, month: number, day: number): string[] => {
  const era = eraForDate(year, month, day);
  if (!era) {
    return [];
  }
  return [formatEraYear(era, year)];
};

const toWarekiFromYear = (year: number): string[] => {
  const eras = erasForYear(year);
  const result: string[] = [];
  for (const era of eras) {
    result.push(formatEraYear(era, year));
    result.push(formatEraYearShort(era, year));
  }
  return result;
};

const toWarekiFromYearMonth = (year: number, month: number): string[] => {
  const eras = erasForYear(year);
  const result: string[] = [];
  for (const era of eras) {
    const eraYear = year - era.startYear + 1;
    const yearStr = eraYear === 1 ? "元" : String(eraYear);
    result.push(`${era.name}${yearStr}年${month}月`);
  }
  return result;
};

const fromWareki = (prefix: string, eraYear: number): number | null => {
  const era = ERAS.find((e) => e.prefix === prefix);
  if (!era) {
    return null;
  }
  return era.startYear + eraYear - 1;
};

const findEraByPrefix = (prefix: string): Era | null => {
  return ERAS.find((e) => e.prefix === prefix) || null;
};

export = {
  ERAS,
  eraForDate,
  erasForYear,
  formatEraYear,
  formatEraYearShort,
  toWarekiFromDate,
  toWarekiFromYear,
  toWarekiFromYearMonth,
  fromWareki,
  findEraByPrefix,
};
