interface ExpPattern<T> {
  date?: (year: number, month: number, day: number) => T;
  yearMonth?: (year: number, month: number) => T;
  year?: (value: number) => T;
  eraYear?: (prefix: string, eraYearNum: number) => T;
  time?: () => T;
  methodCall?: (primary: Exp, method: string) => T;
}

type Exp = <T>(pattern: ExpPattern<T>) => T;

const ExpModule = {
  match: <T>(data: Exp, pattern: ExpPattern<T>): T => {
    return data(pattern);
  },
  date: (year: number, month: number, day: number): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.date!(year, month, day);
    };
  },
  yearMonth: (year: number, month: number): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.yearMonth!(year, month);
    };
  },
  year: (value: number): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.year!(value);
    };
  },
  eraYear: (prefix: string, eraYearNum: number): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.eraYear!(prefix, eraYearNum);
    };
  },
  time: (): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.time!();
    };
  },
  methodCall: (primary: Exp, method: string): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.methodCall!(primary, method);
    };
  },
};

export = ExpModule;
