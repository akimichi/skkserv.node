const Pair = require('kansuu.js').pair;
const List = require('kansuu.js').monad.list;

import Exp = require('./exp');

const Self: any = {
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
  plus: (p: any) => (q: any) => {
    return (input: any) => {
      return List.append(p(input))(q(input));
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
  some: (parser: any) => {
    return Self.flatMap(parser)((a: any) => {
      return Self.flatMap(Self.many(parser))((b: any) => {
        return Self.pure(List.cons(a, b));
      });
    });
  },
  spaces: (input: any) => {
    const isSpace = (x: string) => {
      return /^[ \t\n]/.test(x);
    };
    return Self.flatMap(Self.many(Self.sat(isSpace)))((_: any) => {
      return Self.pure(Pair.empty());
    })(input);
  },
  junk: (input: any) => {
    return Self.spaces(input);
  },
  parse: (parser: any) => {
    return Self.flatMap(Self.junk)((_: any) => {
      return Self.flatMap(parser)((v: any) => {
        return Self.pure(v);
      });
    });
  },
  token: (parser: any) => {
    return Self.flatMap(parser)((v: any) => {
      return Self.flatMap(Self.junk)((_: any) => {
        return Self.pure(v);
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
    return Self.flatMap(Self.some(Self.digit))((xs: any) => {
      return Self.pure(read(xs));
    })(input);
  },
  int: (input: any) => {
    return Self.plus(
      Self.flatMap(Self.char("-"))((_: any) => {
        return Self.flatMap(Self.nat)((n: number) => {
          return Self.pure(-n);
        });
      })
    )(Self.nat)(input);
  },
  float: (input: any) => {
    const minus = Self.char("-"),
      dot = Self.char(".");
    return Self.plus(
      Self.flatMap(minus)((_: any) => {
        return Self.flatMap(Self.many1(Self.digit))((n: any) => {
          return Self.flatMap(dot)((_: any) => {
            return Self.flatMap(Self.many1(Self.digit))((m: any) => {
              const nn = List.toString(n),
                mm = List.toString(m);
              return Self.pure(parseFloat(`-${nn}.${mm}`));
            });
          });
        });
      }))(Self.flatMap(Self.many1(Self.digit))((n: any) => {
      return Self.flatMap(dot)((_: any) => {
        return Self.flatMap(Self.many1(Self.digit))((m: any) => {
          const nn = List.toString(n),
            mm = List.toString(m);
          return Self.pure(parseFloat(`${nn}.${mm}`));
        });
      });
    }))(input);
  },
  numeric: (input: any) => {
    return Self.plus(Self.float)(Self.int)(input);
  },
  // 数値リテラル → Exp.num
  number: (input: any) => {
    return Self.flatMap(Self.token(Self.numeric))((v: any) => {
      return Self.pure(Exp.num(v));
    })(input);
  },
  // factor = number | '(' expression ')'
  factor: (input: any) => {
    const parenExpr = Self.flatMap(Self.token(Self.char("(")))((_: any) => {
      return Self.flatMap(Self.expression)((expr: any) => {
        return Self.flatMap(Self.token(Self.char(")")))((_: any) => {
          return Self.pure(expr);
        });
      });
    });
    return Self.alt(Self.number, parenExpr)(input);
  },
  // term = factor (('*' | '/') factor)*
  term: (input: any) => {
    return Self.flatMap(Self.token(Self.factor))((first: any) => {
      return Self.flatMap(Self.many(
        Self.flatMap(Self.token(Self.alt(Self.char('*'), Self.char('/'))))((op: any) => {
          return Self.flatMap(Self.token(Self.factor))((right: any) => {
            return Self.pure(Pair.cons(op, right));
          });
        })
      ))((rest: any) => {
        const pairs = List.toArray(rest);
        const result = pairs.reduce((acc: any, pair: any) => {
          return Pair.match(pair, {
            cons: (op: any, right: any) => {
              if (op === '*') {
                return Exp.multiply(acc, right);
              } else {
                return Exp.divide(acc, right);
              }
            }
          });
        }, first);
        return Self.pure(result);
      });
    })(input);
  },
  // expression = term (('+' | '-') term)*
  expression: (input: any) => {
    return Self.flatMap(Self.token(Self.term))((first: any) => {
      return Self.flatMap(Self.many(
        Self.flatMap(Self.token(Self.alt(Self.char('+'), Self.char('-'))))((op: any) => {
          return Self.flatMap(Self.token(Self.term))((right: any) => {
            return Self.pure(Pair.cons(op, right));
          });
        })
      ))((rest: any) => {
        const pairs = List.toArray(rest);
        const result = pairs.reduce((acc: any, pair: any) => {
          return Pair.match(pair, {
            cons: (op: any, right: any) => {
              if (op === '+') {
                return Exp.add(acc, right);
              } else {
                return Exp.subtract(acc, right);
              }
            }
          });
        }, first);
        return Self.pure(result);
      });
    })(input);
  }
};

export = Self;
