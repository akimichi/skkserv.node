import kansuu = require('kansuu.js');
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
  result: (v: any) => {
    return Self.pure(v);
  },
  empty: (input: any) => {
    return List.empty();
  },
  zero: (input: any) => {
    return Self.empty(input);
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
  seq: (p: any) => (q: any) => {
    return Self.flatMap(p)((x: any) => {
      return Self.flatMap(q)((y: any) => {
        return Pair.cons(x, y);
      });
    });
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
  first: (p: any) => {
    return (input: any) => {
      return List.match(p(input), {
        empty: (_: any) => {
          return List.empty();
        },
        cons: (head: any, tail: any) => {
          return List.unit(head);
        }
      });
    };
  },
  fmap: (f: any) => (parserA: any) => {
    return (input: any) => {
      return List.match(parserA(input), {
        empty: () => {
          return List.empty();
        },
        cons: (pair: any, _: any) => {
          return Pair.match(pair, {
            cons: (v: any, out: any) => {
              return List.cons(Pair.cons(f(v), out),
                List.empty());
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
  lower: (input: any) => {
    const isLower = (x: string) => {
      return /^[a-z]/.test(x);
    };
    return Self.sat(isLower)(input);
  },
  upper: (input: any) => {
    const isUpper = (x: string) => {
      return /^[A-Z]/.test(x);
    };
    return Self.sat(isUpper)(input);
  },
  digit: (input: any) => {
    const isDigit = (x: string) => {
      return /^[0-9]/.test(x);
    };
    return Self.sat(isDigit)(input);
  },
  letter: (input: any) => {
    return Self.plus(Self.lower)(Self.upper)(input);
  },
  alphanum: (input: any) => {
    return Self.plus(Self.letter)(Self.digit)(input);
  },
  char: (x: string) => {
    const isX = (input: string) => {
      return (x === input);
    };
    return Self.sat(isX);
  },
  chars: (str: any) => {
    return List.match(str, {
      empty: () => {
        return Self.pure(List.empty());
      },
      cons: (x: any, xs: any) => {
        return Self.flatMap(Self.char(x))((_: any) => {
          return Self.flatMap(Self.chars(xs))((_: any) => {
            return Self.pure(List.toString(List.cons(x, xs)));
          });
        });
      }
    });
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
  sepby1: (p: any) => (sep: any) => {
    return (input: any) => {
      return Self.flatMap(p)((x: any) => {
        return Self.flatMap(Self.many(
          Self.flatMap(sep)((_: any) => {
            return Self.flatMap(p)((y: any) => {
              return Self.pure(y);
            });
          })
        ))((xs: any) => {
          return Self.pure(List.cons(x, xs));
        });
      })(input);
    };
  },
  sepby: (p: any) => (sep: any) => {
    return (input: any) => {
      return Self.plus(Self.sepby1(p)(sep))(Self.pure(List.empty()))(input);
    };
  },
  bracket: (open: any, p: any, close: any) => {
    return (input: any) => {
      return Self.flatMap(open)((_: any) => {
        return Self.flatMap(p)((x: any) => {
          return Self.flatMap(close)((_: any) => {
            return Self.pure(x);
          });
        });
      })(input);
    };
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
  ident: (input: any) => {
    return Self.flatMap(Self.lower)((x: any) => {
      return Self.flatMap(Self.many(Self.alphanum))((xs: any) => {
        return Self.pure(List.toString(List.cons(x, xs)));
      });
    })(input);
  },
  identifier: (keywords: any) => {
    return (input: any) => {
      return Self.token(Self.flatMap(Self.ident)((x: any) => {
        if (List.elem(keywords)(x)) {
          return Self.zero;
        } else {
          return Self.pure(x);
        }
      }))(input);
    };
  },
  spaces: (input: any) => {
    const isSpace = (x: string) => {
      return /^[ \t\n]/.test(x);
    };
    return Self.flatMap(Self.many(Self.sat(isSpace)))((_: any) => {
      return Self.pure(Pair.empty());
    })(input);
  },
  comment: (input: any) => {
    const isEOL = (x: string) => {
      return /^[\n]/.test(x);
    };
    return Self.flatMap(Self.char(";"))((_: any) => {
      return Self.flatMap(Self.many1(Self.sat(kansuu.not(isEOL))))((_: any) => {
        return Self.pure(Pair.empty());
      });
    })(input);
  },
  junk: (input: any) => {
    return Self.flatMap(Self.first(Self.plus(Self.spaces)(Self.comment)))((_: any) => {
      return Self.pure(Pair.empty());
    })(input);
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
  natural: (input: any) => {
    return Self.token(Self.nat)(input);
  },
  integer: (input: any) => {
    return Self.token(Self.int)(input);
  },
  numeric: (input: any) => {
    return Self.plus(Self.float)(Self.int)(input);
  },
  boolean: (input: any) => {
    const t = List.fromString("#t"),
      f = List.fromString("#f");
    return Self.flatMap(Self.token(Self.alt(Self.chars(t), Self.chars(f))))((v: any) => {
      switch (v) {
        case "#t":
          return Self.pure(true);
        case "#f":
          return Self.pure(false);
      }
    })(input);
  },
  string: (input: any) => {
    const quote = Self.char('"');
    const stringContent = () => {
      const notQuote = (x: string) => {
        if (x.match(/^"/)) {
          return false;
        } else {
          return true;
        }
      };
      return Self.flatMap(Self.many(Self.sat(notQuote)))((xs: any) => {
        return Self.pure(List.toString(xs));
      });
    };
    return Self.flatMap(quote)((_: any) => {
      return Self.flatMap(stringContent())((xs: any) => {
        return Self.flatMap(quote)((_: any) => {
          return Self.pure(xs);
        });
      });
    })(input);
  },
  symbol: (xs: any) => {
    return Self.token(Self.chars(xs));
  },
  variable: (input: any) => {
    const letter = (input: any) => {
      const isSpecialAlphabet = (x: string) => {
        return /^[!$%&\*\+\-\./:<=>\?@^_~]/.test(x);
      };
      return Self.plus(Self.letter)(Self.sat(isSpecialAlphabet))(input);
    };
    const alphanum = (input: any) => {
      return Self.plus(letter)(Self.digit)(input);
    };
    return Self.flatMap(letter)((x: any) => {
      return Self.flatMap(Self.many(alphanum))((xs: any) => {
        const name = List.toString(List.cons(x, xs));
        return Self.pure(Exp.variable(name));
      });
    })(input);
  },
  atom: (input: any) => {
    return Self.flatMap(Self.plus(Self.plus(Self.numeric)(Self.boolean))(Self.string))((v: any) => {
      return Self.pure(Exp.atom(v));
    })(input);
  },
  expression: (input: any) => {
    return (Self.alt(Self.atom, Self.alt(Self.variable, Self.alt(Self.lambda, Self.alt(Self.ifExpr, Self.alt(Self.list, Self.app))))))(input);
  },
  app: (input: any) => {
    const open = Self.char("("),
      close = Self.char(")");
    return Self.flatMap(open)((_: any) => {
      return Self.flatMap(Self.many(Self.token(Self.expression)))((items: any) => {
        return Self.flatMap(close)((_: any) => {
          switch (List.length(items)) {
            case 0:
              return Self.pure(Exp.list(List.empty()));
            case 1:
              return Self.pure(Exp.app(List.head(items), Exp.variable("_")));
            case 2:
              return Self.pure(
                Exp.app(
                  List.head(items), List.at(items)(1))
              );
            case 3:
              return Self.pure(
                Exp.app(
                  Exp.app(
                    List.head(items), List.at(items)(1)),
                  List.at(items)(2))
              );
            default:
              console.log(`List.toArray(items): ${List.toArray(items)}`)
              throw new Error("引数が3個以上には未対応")
          }
        });
      });
    })(input);
  },
  list: (input: any) => {
    const quote = Self.char("'"),
      open = Self.char("("),
      close = Self.char(")");
    return Self.flatMap(quote)((_: any) => {
      return Self.flatMap(open)((_: any) => {
        return Self.flatMap(Self.many(Self.token(Self.expression)))((items: any) => {
          return Self.flatMap(close)((_: any) => {
            return Self.pure(Exp.list(items));
          });
        });
      });
    })(input);
  },
  ifExpr: (input: any) => {
    const ifChars = Self.token(Self.chars(List.fromString("if"))),
      open = Self.char("("),
      close = Self.char(")");
    return Self.flatMap(open)((_: any) => {
      return Self.flatMap(ifChars)((_: any) => {
        return Self.flatMap(Self.token(Self.expression))((predicate: any) => {
          return Self.flatMap(Self.token(Self.expression))((consequent: any) => {
            return Self.flatMap(Self.token(Self.expression))((alternative: any) => {
              return Self.flatMap(close)((_: any) => {
                return Self.pure(Exp.ifExpr(predicate, consequent, alternative));
              });
            });
          });
        });
      });
    })(input);
  },
  lambda: (input: any) => {
    const open = Self.token(Self.char("(")),
      close = Self.token(Self.char(")")),
      comma = Self.token(Self.char(","));
    const argument = (input: any) => {
      return Self.bracket(open, Self.identifier(List.empty()), close)(input);
    };
    return Self.flatMap(open)((_: any) => {
      return Self.flatMap(Self.token(Self.chars(List.fromString("lambda"))))((_: any) => {
        return Self.flatMap(argument)((arg: any) => {
          return Self.flatMap(Self.expression)((body: any) => {
            return Self.flatMap(close)((_: any) => {
              return Self.pure(
                Exp.lambda(Exp.variable(arg), body)
              );
            });
          });
        });
      });
    })(input);
  },
};

export = Self;
