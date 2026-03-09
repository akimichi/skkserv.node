type ContCallback<T> = (err: Error | null, value: T) => any;
type Cont<T> = (cont: ContCallback<T>) => any;

const NodeCont = {
  unit: <T>(arg: T): Cont<T> => (cont) => {
    return cont(null, arg);
  },
  fail: (err: Error): Cont<never> => (cont) => {
    return cont(err, null as never);
  },
  flatMap: <T>(m: Cont<T>) => <U>(f: (err: Error | null, value: T) => Cont<U>) => (cont: ContCallback<U>): any => {
    return m((err, value) => {
      return f(err, value)(cont);
    });
  },
  stop: <T>(err: Error | null, value: T): T => {
    if (err) {
      throw new Error(err.message || String(err));
    } else {
      return value;
    }
  },
  callCC: <T>(f: (exit: (err: Error | null, value: T) => Cont<T>) => Cont<T>): Cont<T> => (cont) => {
    return f((err, value) => {
      return (_: any) => {
        return cont(err, value);
      };
    })(cont);
  }
};

export = NodeCont;
