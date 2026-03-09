declare module 'expect.js' {
  interface Assertion {
    ok(): void;
    be: Assertion;
    to: Assertion;
    a(type: string): void;
    an(type: string): void;
    equal(value: any): void;
    eql(value: any): void;
    match(regexp: RegExp): void;
    contain(value: any): void;
    within(start: number, finish: number): void;
    greaterThan(value: number): void;
    lessThan(value: number): void;
    above(value: number): void;
    below(value: number): void;
    empty(): void;
    length(value: number): void;
    property(name: string, value?: any): void;
    key(name: string): void;
    keys(...names: string[]): void;
    throwError(fn?: Function): void;
    throwException(fn?: Function): void;
    fail(message?: string): void;
    not: Assertion;
  }

  function expect(value?: any): Assertion;
  export = expect;
}
