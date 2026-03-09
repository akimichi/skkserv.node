// Church-encoded types for kansuu.js
type ChurchPair<L, R> = <T>(pattern: { cons: (left: L, right: R) => T }) => T;
type ChurchList<T> = <R>(pattern: {
  empty: (...args: any[]) => R;
  cons: (head: T, tail: ChurchList<T>) => R;
}) => R;
type ChurchEither<L, R> = <T>(pattern: {
  left: (value: L) => T;
  right: (value: R) => T;
}) => T;

declare module 'kansuu.js' {
  // Top-level functions
  export function match<T>(data: any, pattern: any): T;
  export function id<T>(x: T): T;
  export function compose<A, B, C>(f: (b: B) => C): (g: (a: A) => B) => (a: A) => C;
  export function flip<A, B, C>(f: (a: A) => (b: B) => C): (b: B) => (a: A) => C;
  export function not(predicate: (x: any) => boolean): (x: any) => boolean;
  export function and(a: boolean): (b: boolean) => boolean;
  export function or(a: boolean): (b: boolean) => boolean;
  export function times(n: number): (f: (acc: any) => any) => (init: any) => any;
  export function curry<A, B, C>(f: (a: A, b: B) => C): (a: A) => (b: B) => C;
  export function uncurry<A, B, C>(f: (a: A) => (b: B) => C): (a: A, b: B) => C;
  export function typeOf(x: any): string;

  // Pair module
  export const pair: {
    cons<L, R>(left: L, right: R): ChurchPair<L, R>;
    match<L, R, T>(pair: ChurchPair<L, R>, pattern: { cons: (left: L, right: R) => T }): T;
    left<L, R>(pair: ChurchPair<L, R>): L;
    right<L, R>(pair: ChurchPair<L, R>): R;
    swap<L, R>(pair: ChurchPair<L, R>): ChurchPair<R, L>;
    toArray<L, R>(pair: ChurchPair<L, R>): [L, R];
    empty(): ChurchPair<any, any>;
    mkPair<L, R>(left: L, right: R): ChurchPair<L, R>;
    isEmpty(pair: any): boolean;
  };

  // Array module
  export const array: {
    empty<T>(): T[];
    isEmpty<T>(arr: T[]): boolean;
    cons<T>(head: T, tail: T[]): T[];
    snoc<T>(arr: T[], item: T): T[];
    push<T>(arr: T[], item: T): T[];
    head<T>(arr: T[]): T;
    tail<T>(arr: T[]): T[];
    concat<T>(a: T[], b: T[]): T[];
    toString(arr: any[]): string;
    fromString(str: string): string[];
    join(arr: any[]): string;
    and(arr: boolean[]): boolean;
    or(arr: boolean[]): boolean;
    all<T>(arr: T[]): (pred: (x: T) => boolean) => boolean;
    any<T>(arr: T[]): (pred: (x: T) => boolean) => boolean;
    elem<T>(arr: T[]): (item: T) => boolean;
    take<T>(arr: T[], n: number): T[];
    drop<T>(arr: T[], n: number): T[];
    reverse<T>(arr: T[]): T[];
    init<T>(arr: T[]): T[];
    length<T>(arr: T[]): number;
    splitAt<T>(arr: T[], n: number): [T[], T[]];
    takeWhile<T>(arr: T[]): (pred: (x: T) => boolean) => T[];
    dropWhile<T>(arr: T[]): (pred: (x: T) => boolean) => T[];
    before<T>(arr: T[], item: T): T[];
    after<T>(arr: T[], item: T): T[];
    zip<A, B>(a: A[], b: B[]): [A, B][];
    reduce<T, R>(arr: T[]): (init: R) => (f: (acc: R, x: T) => R) => R;
    foldr<T, R>(arr: T[]): (init: R) => (f: (x: T) => (acc: R) => R) => R;
    foldr1<T>(arr: T[]): (f: (x: T) => (acc: T) => T) => T;
    foldl<T, R>(arr: T[]): (init: R) => (f: (x: T) => (acc: R) => R) => R;
    foldl1<T>(arr: T[]): (f: (x: T) => (acc: T) => T) => T;
    last<T>(arr: T[]): T;
    map<T, R>(arr: T[]): (f: (x: T) => R) => R[];
    flatten<T>(arr: T[][]): T[];
    flatMap<T, R>(arr: T[]): (f: (x: T) => R[]) => R[];
    filter<T>(arr: T[]): (pred: (x: T) => boolean) => T[];
    span<T>(arr: T[]): (pred: (x: T) => boolean) => [T[], T[]];
    breaks<T>(arr: T[]): (pred: (x: T) => boolean) => [T[], T[]];
    lines(str: string): string[];
    unlines(arr: string[]): string;
  };

  // Monad module
  export const monad: {
    list: {
      match<T, R>(list: ChurchList<T>, pattern: {
        empty: (...args: any[]) => R;
        cons: (head: T, tail: ChurchList<T>) => R;
      }): R;
      empty<T>(): ChurchList<T>;
      unit<T>(value: T): ChurchList<T>;
      cons<T>(head: T, tail: ChurchList<T>): ChurchList<T>;
      head<T>(list: ChurchList<T>): T;
      tail<T>(list: ChurchList<T>): ChurchList<T>;
      isEmpty<T>(list: ChurchList<T>): any;
      elem<T>(list: ChurchList<T>): (item: T) => boolean;
      append<T>(listA: ChurchList<T>): (listB: ChurchList<T>) => ChurchList<T>;
      reduce<T, R>(list: ChurchList<T>): (init: R) => (f: (acc: R, x: T) => R) => R;
      take<T>(list: ChurchList<T>): (n: number) => ChurchList<T>;
      drop<T>(list: ChurchList<T>): (n: number) => ChurchList<T>;
      splitAt<T>(list: ChurchList<T>): (n: number) => ChurchPair<ChurchList<T>, ChurchList<T>>;
      init<T>(list: ChurchList<T>): ChurchList<T>;
      length<T>(list: ChurchList<T>): number;
      last<T>(list: ChurchList<T>): T;
      at<T>(list: ChurchList<T>): (index: number) => T;
      fromVector<T>(arr: T[]): ChurchList<T>;
      fromString(str: string): ChurchList<string>;
      mkList<T>(...items: T[]): ChurchList<T>;
      snoc<T>(list: ChurchList<T>): (item: T) => ChurchList<T>;
      concat<T>(lists: ChurchList<ChurchList<T>>): ChurchList<T>;
      map<T, R>(list: ChurchList<T>): (f: (x: T) => R) => ChurchList<R>;
      join<T>(list: ChurchList<ChurchList<T>>): ChurchList<T>;
      flatMap<T, R>(list: ChurchList<T>): (f: (x: T) => ChurchList<R>) => ChurchList<R>;
      filter<T>(list: ChurchList<T>): (pred: (x: T) => boolean) => ChurchList<T>;
      toArray<T>(list: ChurchList<T>): T[];
      toString(list: ChurchList<string>): string;
      foldr<T, R>(list: ChurchList<T>): (init: R) => (f: (x: T) => (acc: R) => R) => R;
      foldr1<T>(list: ChurchList<T>): (f: (x: T) => (acc: T) => T) => T;
      foldl<T, R>(list: ChurchList<T>): (init: R) => (f: (x: T) => (acc: R) => R) => R;
      foldl1<T>(list: ChurchList<T>): (f: (x: T) => (acc: T) => T) => T;
      reverse<T>(list: ChurchList<T>): ChurchList<T>;
      zip<A, B>(listA: ChurchList<A>): (listB: ChurchList<B>) => ChurchList<ChurchPair<A, B>>;
      zipWith<A, B, C>(f: (a: A) => (b: B) => C): (listA: ChurchList<A>) => (listB: ChurchList<B>) => ChurchList<C>;
      pairs<T>(list: ChurchList<T>): ChurchList<ChurchPair<T, T>>;
      sum(list: ChurchList<number>): number;
      merge<T>(listA: ChurchList<T>): (listB: ChurchList<T>) => ChurchList<T>;
      halve<T>(list: ChurchList<T>): ChurchPair<ChurchList<T>, ChurchList<T>>;
      sort<T>(list: ChurchList<T>): ChurchList<T>;
      unfold<T, R>(f: (seed: T) => any): (seed: T) => ChurchList<R>;
      isEqual<T>(listA: ChurchList<T>): (listB: ChurchList<T>) => boolean;
      and(list: ChurchList<boolean>): boolean;
    };
    either: {
      match<L, R, T>(either: ChurchEither<L, R>, pattern: {
        left: (value: L) => T;
        right: (value: R) => T;
      }): T;
      left<L, R = any>(value: L): ChurchEither<L, R>;
      right<L, R>(value: R): ChurchEither<L, R>;
      unit<L, R>(value: R): ChurchEither<L, R>;
      flatMap<L, A, B>(either: ChurchEither<L, A>): (f: (value: A) => ChurchEither<L, B>) => ChurchEither<L, B>;
      map<L, A, B>(either: ChurchEither<L, A>): (f: (value: A) => B) => ChurchEither<L, B>;
    };
    identity: {
      unit<T>(value: T): T;
      flatMap<A, B>(value: A): (f: (value: A) => B) => B;
    };
    maybe: {
      match<T, R>(maybe: any, pattern: { just: (value: T) => R; nothing: () => R }): R;
      just<T>(value: T): any;
      nothing(): any;
      unit<T>(value: T): any;
      flatMap<A, B>(maybe: any): (f: (value: A) => any) => any;
    };
  };

  // Top-level either (different API from monad.either)
  export const either: {
    match<L, R, T>(either: ChurchEither<L, R>, pattern: {
      left: (value: L) => T;
      right: (value: R) => T;
    }): T;
    unit<L, R>(value: R): ChurchEither<L, R>;
    left<L, R = any>(value: L): ChurchEither<L, R>;
    right<L, R>(value: R): ChurchEither<L, R>;
    flatMap<L, A, B>(either: ChurchEither<L, A>): (f: (value: A) => ChurchEither<L, B>) => ChurchEither<L, B>;
  };
}
