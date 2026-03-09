type AtomValue = number | string | boolean | undefined;

interface ExpPattern<T> {
  exp?: () => T;
  atom?: (value: AtomValue) => T;
  variable?: (name: string) => T;
  lambda?: (variable: Exp, body: Exp) => T;
  app?: (operator: Exp, operand: Exp) => T;
  list?: (items: any) => T;
  nil?: () => T;
  cons?: (head: Exp, tail: Exp) => T;
  identifier?: (name: string) => T;
  ifExpr?: (predicate: Exp, consequent: Exp, alternative: Exp) => T;
  isEqual?: (left: Exp, right: Exp) => T;
  and?: (left: Exp, right: Exp) => T;
  or?: (left: Exp, right: Exp) => T;
  not?: (exp: Exp) => T;
  succ?: (exp: Exp) => T;
  add?: (left: Exp, right: Exp) => T;
  subtract?: (left: Exp, right: Exp) => T;
  multiply?: (left: Exp, right: Exp) => T;
  divide?: (left: Exp, right: Exp) => T;
  expt?: (base: Exp, exponent: Exp) => T;
  today_?: (arg: Exp) => T;
  now_?: (arg: Exp) => T;
}

type Exp = <T>(pattern: ExpPattern<T>) => T;

const ExpModule = {
  type: (pattern: ExpPattern<any>): any => {
    return pattern.exp!();
  },
  match: <T>(data: Exp, pattern: ExpPattern<T>): T => {
    return data(pattern);
  },
  atom: (value: AtomValue): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.atom!(value);
    };
  },
  list: (items: any): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.list!(items);
    };
  },
  nil: (_?: any): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.nil!();
    };
  },
  cons: (head: Exp, tail: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.cons!(head, tail);
    };
  },
  variable: (name: string): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.variable!(name);
    };
  },
  lambda: (variable: Exp, bodyExpression: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.lambda!(variable, bodyExpression);
    };
  },
  app: (operator: Exp, operand: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.app!(operator, operand);
    };
  },
  identifier: (name: string): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.identifier!(name);
    };
  },
  ifExpr: (predicate: Exp, consequent: Exp, alternative: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.ifExpr!(predicate, consequent, alternative);
    };
  },
  isEqual: (expL: Exp, expR: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.isEqual!(expL, expR);
    };
  },
  and: (expL: Exp, expR: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.and!(expL, expR);
    };
  },
  or: (expL: Exp, expR: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.or!(expL, expR);
    };
  },
  not: (exp: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.not!(exp);
    };
  },
  succ: (exp: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.succ!(exp);
    };
  },
  add: (expL: Exp, expR: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.add!(expL, expR);
    };
  },
  subtract: (expL: Exp, expR: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.subtract!(expL, expR);
    };
  },
  multiply: (expL: Exp, expR: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.multiply!(expL, expR);
    };
  },
  divide: (expL: Exp, expR: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.divide!(expL, expR);
    };
  },
  expt: (base: Exp, exponent: Exp): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.expt!(base, exponent);
    };
  },
  today_: (_: any): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.today_!(_);
    };
  },
  now_: (_: any): Exp => {
    return <T>(pattern: ExpPattern<T>): T => {
      return pattern.now_!(_);
    };
  }
};

export = ExpModule;
