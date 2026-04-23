const Pair = require('kansuu.js').pair;
const List = require('kansuu.js').monad.list;

import Exp = require('./exp');

const Self: any = {
  // --- パーサーコンビネータ基盤（arith/parser.tsより） ---
  pure: (v: any) => {
    return (input: any) => {
      return List.cons(
        Pair.cons(v, input), List.empty()
      );
    };
  },
  zero: (input: any) => {
    return List.empty();
  },
  flatMap: (parser: any) => (f: any) => {
    return (input: any) => {
      return List.match(parser(input), {
        empty: (_: any) => {
          return List.empty();
        },
        cons: (pair: any, _: any) => {
          return Pair.match(pair, {
            cons: (v: any, out: any) => {
              return f(v)(out);
            }
          });
        }
      });
    };
  },
  alt: (parserA: any, parserB: any) => {
    return (input: any) => {
      return List.match(parserA(input), {
        empty: () => {
          return parserB(input);
        },
        cons: (pair: any, _: any) => {
          return Pair.match(pair, {
            cons: (v: any, out: any) => {
              return List.cons(Pair.cons(v, out),
                List.empty(0));
            }
          });
        }
      });
    };
  },
  item: (input: any) => {
    return List.match(input, {
      empty: (_: any) => {
        return List.empty();
      },
      cons: (head: any, tail: any) => {
        return List.cons(
          Pair.cons(head, tail),
          List.empty()
        );
      }
    });
  },
  sat: (predicate: (x: any) => boolean) => {
    return Self.flatMap(Self.item)((x: any) => {
      if (predicate(x) === true) {
        return Self.pure(x);
      } else {
        return Self.zero;
      }
    });
  },
  digit: (input: any) => {
    const isDigit = (x: string) => {
      return /^[0-9]/.test(x);
    };
    return Self.sat(isDigit)(input);
  },
  char: (x: string) => {
    const isX = (input: string) => {
      return (x === input);
    };
    return Self.sat(isX);
  },
  plus: (p: any) => (q: any) => {
    return (input: any) => {
      return List.append(p(input))(q(input));
    };
  },
  many: (parser: any) => {
    return (input: any) => {
      return Self.plus(Self.flatMap(parser)((x: any) => {
        return Self.flatMap(Self.many(parser))((xs: any) => {
          return Self.pure(List.cons(x, xs));
        });
      }))(Self.pure(List.empty()))(input);
    };
  },
  many1: (parser: any) => {
    return Self.flatMap(parser)((x: any) => {
      return Self.flatMap(Self.many(parser))((xs: any) => {
        return Self.pure(List.cons(x, xs));
      });
    });
  },
  nat: (input: any) => {
    const read = (xs: any) => {
      const list2str = (xs: any) => {
        return List.foldr(xs)("")((x: any) => {
          return (accumulator: string) => {
            return x + accumulator;
          };
        });
      };
      return parseInt(list2str(xs), 10);
    };
    return Self.flatMap(Self.many1(Self.digit))((xs: any) => {
      return Self.pure(read(xs));
    })(input);
  },
  parse: (parser: any) => {
    return parser;
  },

  // --- 文字列マッチ ---
  string: (str: string) => {
    if (str.length === 0) {
      return Self.pure("");
    }
    return Self.flatMap(Self.char(str[0]))((_: any) => {
      return Self.flatMap(Self.string(str.slice(1)))((_: any) => {
        return Self.pure(str);
      });
    });
  },

  // --- datetime固有のパーサー ---

  // keyword: today | now | yesterday | tomorrow | kyou | ashita | kinou
  keyword: (input: any) => {
    const keywords: { [key: string]: () => any } = {
      "tomorrow": () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return Exp.date(d.getFullYear(), d.getMonth() + 1, d.getDate());
      },
      "yesterday": () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return Exp.date(d.getFullYear(), d.getMonth() + 1, d.getDate());
      },
      "today": () => {
        const d = new Date();
        return Exp.date(d.getFullYear(), d.getMonth() + 1, d.getDate());
      },
      "kyou": () => {
        const d = new Date();
        return Exp.date(d.getFullYear(), d.getMonth() + 1, d.getDate());
      },
      "ashita": () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return Exp.date(d.getFullYear(), d.getMonth() + 1, d.getDate());
      },
      "kinou": () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return Exp.date(d.getFullYear(), d.getMonth() + 1, d.getDate());
      },
      "now": () => {
        return Exp.time();
      },
    };
    // 長いキーワードから先にマッチを試みる
    const sorted = Object.keys(keywords).sort((a, b) => b.length - a.length);
    let parser = Self.zero;
    for (const kw of sorted) {
      const kwParser = Self.flatMap(Self.string(kw))((_: any) => {
        return Self.pure(keywords[kw]());
      });
      parser = Self.alt(parser, kwParser);
    }
    return parser(input);
  },

  // era_ref: [RHTMS] DIGITS — e.g., R8, H31
  eraRef: (input: any) => {
    const eraChar = Self.sat((x: string) => "RHTMS".indexOf(x) >= 0);
    return Self.flatMap(eraChar)((prefix: string) => {
      return Self.flatMap(Self.nat)((num: number) => {
        return Self.pure(Exp.eraYear(prefix, num));
      });
    })(input);
  },

  // date_literal: YYYY-MM-DD
  dateLiteral: (input: any) => {
    return Self.flatMap(Self.nat)((year: number) => {
      return Self.flatMap(Self.char("-"))((_: any) => {
        return Self.flatMap(Self.nat)((month: number) => {
          return Self.flatMap(Self.char("-"))((_: any) => {
            return Self.flatMap(Self.nat)((day: number) => {
              return Self.pure(Exp.date(year, month, day));
            });
          });
        });
      });
    })(input);
  },

  // year_month: YYYY-MM
  yearMonthLiteral: (input: any) => {
    return Self.flatMap(Self.nat)((year: number) => {
      return Self.flatMap(Self.char("-"))((_: any) => {
        return Self.flatMap(Self.nat)((month: number) => {
          return Self.pure(Exp.yearMonth(year, month));
        });
      });
    })(input);
  },

  // year_literal: YYYY
  yearLiteral: (input: any) => {
    return Self.flatMap(Self.nat)((year: number) => {
      return Self.pure(Exp.year(year));
    })(input);
  },

  // primary: keyword | era_ref | date_literal | year_month | year_literal
  // dateLiteralはyearMonthより先、yearMonthはyearLiteralより先に試す
  primary: (input: any) => {
    return Self.alt(
      Self.keyword,
      Self.alt(
        Self.eraRef,
        Self.alt(
          Self.dateLiteral,
          Self.alt(
            Self.yearMonthLiteral,
            Self.yearLiteral
          )
        )
      )
    )(input);
  },

  // method: 'wareki' | 'seireki' | 'weekday' | 'month'
  method: (input: any) => {
    const methods = ["weekday", "wareki", "seireki", "month"];
    const sorted = methods.sort((a, b) => b.length - a.length);
    let parser = Self.zero;
    for (const m of sorted) {
      const mParser = Self.flatMap(Self.string(m))((_: any) => {
        return Self.pure(m);
      });
      parser = Self.alt(parser, mParser);
    }
    return parser(input);
  },

  // expression: primary ('.' method)?
  expression: (input: any) => {
    return Self.flatMap(Self.primary)((prim: any) => {
      return Self.alt(
        Self.flatMap(Self.char("."))((_: any) => {
          return Self.flatMap(Self.method)((m: string) => {
            return Self.pure(Exp.methodCall(prim, m));
          });
        }),
        Self.pure(prim)
      );
    })(input);
  },
};

export = Self;
