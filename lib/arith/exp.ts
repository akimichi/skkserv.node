interface ExpPattern<T> {
  num?: (value: number) => T;
  add?: (left: Exp, right: Exp) => T;
  subtract?: (left: Exp, right: Exp) => T;
  multiply?: (left: Exp, right: Exp) => T;
  divide?: (left: Exp, right: Exp) => T;
}

type Exp = <T>(pattern: ExpPattern<T>) => T;

const ExpModule = {
  match: <T>(data: Exp, pattern: ExpPattern<T>): T => {
    return data(pattern);
  },
  num: (value: number): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.num!(value);
    };
  },
  add: (left: Exp, right: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.add!(left, right);
    };
  },
  subtract: (left: Exp, right: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.subtract!(left, right);
    };
  },
  multiply: (left: Exp, right: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.multiply!(left, right);
    };
  },
  divide: (left: Exp, right: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.divide!(left, right);
    };
  }
};

export = ExpModule;
