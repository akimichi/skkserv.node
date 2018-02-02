"use strict";

const expect = require('expect.js'),
 kansuu = require('kansuu.js'),
 Pair = require('kansuu.js').pair,
 List = require('kansuu.js').monad.list,
 ID = require('kansuu.js').monad.identity;

const Exp = require('./exp.js'),
  env = require('./env.js');

const Self = {
  // ~~~
  // pure :: a -> Parser a
  // pure v = \inp -> [(v, inp)]
  // ~~~
  pure: (v) => {
    return (input) => {
      return List.cons(
        Pair.cons(v,input), List.empty()
      );
    };
  },
  result: (v) => {
    return Self.pure(v);
  },
  // empty :: Parser a
  empty: (input) => {
    return List.empty();
  },
  zero: (input) => {
    return Self.empty(input);
  },
  // <*> :: Parser (a -> b) -> Parser a -> Parser b
  // pg <*> px = P (\input -> case parse pg input of
  //                          [] -> []
  //                          [(g,out)] -> parse (fmap g px) out)
  // apply: (pg) => {
  //   return (px) => {
  //     return (input) => {
  //       return List.match(pg(input),{
  //         empty: () => {
  //           return List.empty();
  //         },
  //         cons: (pair,_) => {
  //           return Pair.match(pair,{
  //             cons: (g, out) => {
  //               return fmap(g)(px)(out);
  //             }
  //           });
  //         }
  //       });
  //     };
  //   };
  // },
  // flatMap :: Parser a -> (a -> Parser b) -> Parser b
  // flatMap parser f = \inp -> concat [f v inp' | (v, inp') <- parser inp]
  flatMap: (parser) => (f) => {
    return (input) => {
      return List.match(parser(input),{
        empty: (_) => {
          return List.empty();
        },
        cons: (pair,_) => {
          return Pair.match(pair,{
            cons: (v, out) => {
              return f(v)(out);
            }
          });
        }
      });
    };
  },
  // seq
  seq: (p) => (q) => {
    return Self.flatMap(p)(x => {
      return Self.flatMap(q)(y => {
        return Pair.cons(x,y);
      });
    });
  },
  // plus:: Parser a -> Parser a -> Parser a
  plus: (p) => (q) => {
    return (input) => {
      return List.append(p(input))(q(input));
    };
  },
  // first: Parser a -> Parser a
  // first p = \inp -> case p inp of
  //                        []     -> []
  //                        (x:xs) -> [x]
  first: (p) => {
    return (input) => {
      return List.match(p(input),{
        empty: (_) => {
          return List.empty(); 
        },
        cons: (head, tail) => {
          return List.unit(head); 
        }
      });
    };
  },
  // fmap :: (a -> b) -> Parser a -> Parser b
  fmap: (f) => (parserA) => {
    return (input) => {
      return List.match(parserA(input), {
        empty: () => {
          return List.empty();
        },
        cons: (pair,_) => {
          return Pair.match(pair,{
            cons: (v, out) => {
              return List.cons(Pair.cons(f(v), out),
                List.empty());
            }
          });
        }
      });
    };
  },
  // item :: Parser String
  item: (input) => {
    return List.match(input,{
      empty: (_) => {
        return List.empty();
      },
      cons: (head, tail) => {
        return List.cons(
          Pair.cons(head, tail),
          List.empty()
        );
      }
    });
  },
  // sat :: (String -> Bool) -> Parser String
  sat: (predicate) => {
    return Self.flatMap(Self.item)(x => {
      if(predicate(x) === true) {
        return Self.pure(x);
      } else {
        return Self.zero;
      }
    });
  },
  // alt :: Parser a -> Parser a -> Parser b
  alt: (parserA,parserB) => {
    return (input) => {
      return List.match(parserA(input),{
        empty: () => {
          return parserB(input);
        },
        cons: (pair,_) => {
          return Pair.match(pair,{
            cons: (v, out) => {
              return List.cons(Pair.cons(v,out),
                  List.empty(0));
            }
          });
        }
      });
    };
  },
  // lower :: Parser String 
  lower: (input) => { 
    var isLower = (x) => {
      return /^[a-z]/.test(x);
    };
    return Self.sat(isLower)(input);
  },
  // upper :: Parser String 
  upper: (input) => { 
    var isUpper = (x) => {
      return /^[A-Z]/.test(x);
    };
    return Self.sat(isUpper)(input);
  },
  // digit :: Parser String 
  digit: (input) => { 
    var isDigit = (x) => {
      return /^[0-9]/.test(x);
    };
    return Self.sat(isDigit)(input);
  },
  // letter :: Parser Char
  letter: (input) => { 
    return Self.plus(Self.lower)(Self.upper)(input);
  },
  // alphanum :: Parser Char
  // > Parses a letter or digit (a character between '0' and '9'). Returns the parsed character.
  alphanum: (input) => { 
    return Self.plus(Self.letter)(Self.digit)(input);
  },
  // char :: Char -> Parser Char
  char: (x) => { 
    var isX = (input) => {
      return (x === input);
    };
    return Self.sat(isX);
  },
  // chars :: String -> Parser String 
  chars: (str) => { 
    return List.match(str, {
      empty: () => {
        return Self.pure(List.empty());
      },
      cons: (x,xs) => {
        return Self.flatMap(Self.char(x))((_) => {
          return Self.flatMap(Self.chars(xs))((_) => {
            return Self.pure(List.toString(List.cons(x,xs)));
          });
        });
      }
    });
  },
  // many :: Parser a -> Parser [a]
  // many p = [x:xs | x <- p, xs <- many p] ++ [[]]
  many: (parser) => {
    return (input) => {
      return Self.plus(Self.flatMap(parser)(x => {
        return Self.flatMap(Self.many(parser))(xs => {
          return Self.pure(List.cons(x, xs)); 
        });
      }))(Self.pure(List.empty()))(input);
    };
  },
  // many1:: Parser a -> Parser [a]
  // many1 p = [x:xs | x <- p, xs <- many p]
  many1: (parser) => {
    return Self.flatMap(parser)(x => {
      return Self.flatMap(Self.many(parser))(xs => {
          return Self.pure(List.cons(x,xs)); 
      });
    });
  },
  // some :: Parser a -> Parser [a]
  some: (parser) => {
    return Self.flatMap(parser)(a => {
      return Self.flatMap(Self.many(parser))(b => {
        return Self.pure(List.cons(a,b));
      });
    }); 
  },
  // sepby1: Parser a -> Parser b -> Parser [a]
  // sepby1 p sep = [x:xs | x <- p, xs <- many [y | _ <- sep, y <- p]]
  sepby1: (p) => (sep) => {
    return (input) => {
      return Self.flatMap(p)(x => {
        return Self.flatMap(Self.many(
          Self.flatMap(sep)(_ => {
            return Self.flatMap(p)(y => {
              return Self.pure(y);
            });
          })
        ))(xs => {
          return Self.pure(List.cons(x,xs));
        });
      })(input);
    };
  },
  // sepby:: Parser a -> Parser b -> Parser a
  // sepby p sep = (sepby1 p sep) ++ [[]]
  sepby: (p) => (sep) => {
    return (input) => {
      return Self.plus(Self.sepby1(p)(sep))(Self.pure(List.empty()))(input);
    };
  },
  // bracket:: Parser a -> Parser b -> Parser c -> Parser b
  // bracket open p close = [x | _ <- open, x <- p, _ <- close]
  bracket: (open, p, close) => {
    return (input) => {
      return Self.flatMap(open)(_ => {
        return Self.flatMap(p)(x => {
          return Self.flatMap(close)(_ => {
            return Self.pure(x);
          });
        });
      })(input);
    };
  },
  nat: (input) => {
    var read = (xs) => {
      var list2str = (xs) => {
        return List.foldr(xs)("")((x) => {
          return (accumulator) => {
            return x + accumulator;
          };
        });
      };
      return parseInt(list2str(xs),10);
    };
    return Self.flatMap(Self.some(Self.digit))(xs => {
      return Self.pure(read(xs));
    })(input);
  },
  // ident:: Parser String
  // ident = [x:xs | x <- lower, xs <- many alphanum]
  ident: (input) => {
    return Self.flatMap(Self.lower)(x => {
      return Self.flatMap(Self.many(Self.alphanum))(xs => {
        return Self.pure(List.toString(List.cons(x,xs)));
      });
    })(input);
  },
  // identifier:: [String] -> Parser String
  // identifier ks = token [x | x <- ident, not(elem x ks)]
  identifier: (keywords) => {
    return (input) => {
      return Self.token(Self.flatMap(Self.ident)(x => {
        if(List.elem(keywords)(x)) {
          return Self.zero;
        } else {
          return Self.pure(x); 
        }
      }))(input);
    };
  },
  // spaces:: Parser ()
  // spaces = [() | _ <- many1 (sat isSpace)]
  //          where
  //            isSpace x = 
  //              (x == ' ') || (x == '\n') || (x == '\t')
  spaces: (input) => {
    var isSpace = (x) => {
      return /^[ \t\n]/.test(x);
    };
    return Self.flatMap(Self.many(Self.sat(isSpace)))(_ => {
      return Self.pure(Pair.empty());
    })(input);
  },
  // comment:: Parser ()
  // spaces = [() | _ <- chars("//"),  many1 (sat(\x -> /= '\n'))]
  comment: (input) => {
    var isEOL = (x) => {
      return /^[\n]/.test(x);
    };
    return Self.flatMap(Self.char(";"))(_ => {
      return Self.flatMap(Self.many1(Self.sat(kansuu.not(isEOL))))(_ => {
        return Self.pure(Pair.empty());
      });
    })(input);
  },
  // junk:: Parser ()
  // junk = [() | _ <- many (spaces +++ comment)]
  junk: (input) => {
    return Self.flatMap(Self.first(Self.plus(Self.spaces)(Self.comment)))(_ => {
      return Self.pure(Pair.empty());
    })(input);
  },
  // parse :: Parser a -> Parser a
  // parse p = [v | _ <- junk, v <- p] 
  parse: (parser) => {
    return Self.flatMap(Self.junk)(_ => {
      return Self.flatMap(parser)(v => {
        return Self.pure(v);
      });
    });
  },
  // token :: Parser a -> Parser a
  // token p = [v | v<- p, _ <- junk]
  token: (parser) => {
    return Self.flatMap(parser)(v => {
      return Self.flatMap(Self.junk)(_ => {
        return Self.pure(v);
      });
    });
  },
  int: (input) => {
    return Self.plus(
        Self.flatMap(Self.char("-"))(_ => {
          return Self.flatMap(Self.nat)(n => {
            return Self.pure(-n);
          });
        })
    )(Self.nat)(input);
  },
  float: (input) => {
    const minus = Self.char("-"),
      dot = Self.char("."),
      manyDigits = (input) => {
        return Self.flatMap(Self.some(Self.digit))(xs => {
          return Self.pure(List.toString(xs));
        })(input);
      };
    return Self.plus(
      Self.flatMap(minus)(_ => {
        return Self.flatMap(Self.many1(Self.digit))(n => {
          return Self.flatMap(dot)(_ => {
            return Self.flatMap(Self.many1(Self.digit))(m => {
              const nn = List.toString(n),
                mm = List.toString(m);
              return Self.pure(parseFloat(`-${nn}.${mm}`));
            });
          });
        });
      }))(Self.flatMap(Self.many1(Self.digit))(n => {
        return Self.flatMap(dot)(_ => {
          return Self.flatMap(Self.many1(Self.digit))(m => {
              const nn = List.toString(n),
                mm = List.toString(m);
             return Self.pure(parseFloat(`${nn}.${mm}`));
          });
        });
      }))(input);
  },
  natural: (input) => {
    return Self.token(Self.nat)(input);
  },
  integer: (input) => {
    return Self.token(Self.int)(input);
  },
  numeric: (input) => {
    return Self.plus(Self.float)(Self.int)(input);
  },
  boolean: (input) => {
    const t = List.fromString("#t"),
      f = List.fromString("#f");
    return Self.flatMap(Self.token(Self.alt(Self.chars(t), Self.chars(f))))(v => {
      switch(v) { 
        case "#t": 
          return Self.pure(true);
        case "#f": 
          return Self.pure(false);
      }
    })(input);
  },
  string: (input) => {
    const quote = Self.char('"');
    const stringContent = () => {
      const notQuote = (x) => {
        if(x.match(/^"/)){
          return false;
        } else {
          return true;
        } 
      };
      return Self.flatMap(Self.many(Self.sat(notQuote)))((xs) => {
        return Self.pure(List.toString(xs));
      });
    };
    return Self.flatMap(quote)(_ => {
      return Self.flatMap(stringContent())(xs => {
        return Self.flatMap(quote)(_ => {
          return Self.pure(xs);
        });
      });
    })(input);
  },
  symbol: (xs) => {
    return Self.token(Self.chars(xs));
  },
  // variable: identifier
  variable: (input) => {
    // 拡張アルファベット
    //  ! $ % & * + - . / : < = > ? @ ^ _ ~
    const letter = (input) => {
      var isSpecialAlphabet = (x) => {
        return /^[!$%&\*\+\-\./:<=>\?@^_~]/.test(x);
      };
      return Self.plus(Self.letter)(Self.sat(isSpecialAlphabet))(input);
    },
    alphanum = (input) => { 
      return Self.plus(letter)(Self.digit)(input);
    };
    return Self.flatMap(letter)(x => {
      return Self.flatMap(Self.many(alphanum))(xs => {
        const name = List.toString(List.cons(x,xs));
        return Self.pure(Exp.variable(name));
        // keywords = List.unit("lambda");
        // if(List.elem(keywords)(name)) {
        //   return Self.zero;
        // } else {
        //   return Self.pure(name); 
        // }
      });
    })(input);
  },
  // atom: num | bool | string 
  atom: (input) => {
    // return Self.flatMap(Self.plus(Self.variable)(Self.plus(Self.plus(Self.numeric)(Self.boolean))(Self.string)))(v  => {
    return Self.flatMap(Self.plus(Self.plus(Self.numeric)(Self.boolean))(Self.string))(v  => {
      return Self.pure(Exp.atom(v));
    })(input);
  },
  // s_expression = atom
  //              | variable
  //              | app 
  //              | list 
  expression: (input) => {
    return (Self.plus(Self.atom)(Self.plus(Self.variable)(Self.plus(Self.app)(Self.list))))(input);
    // return (Self.plus(Self.atom)(Self.plus(Self.variable)(Self.list)))(input);
    // return Self.plus(Self.plus(Self.atom)(Self.list))(input);
    // return Self.plus(Self.atom)(Self.list)(input);
  },
  // application = "(" s_expression < s_expression > ")"
  app: (input) => {
    const open = Self.char("("),
      close = Self.char(")");
    return Self.flatMap(open)(_ => {
      return Self.flatMap(Self.many(Self.token(Self.expression)))(items=> {
        return Self.flatMap(close)(_ => {
          switch(List.length(items)) {
            case 0: // 空リスト ()  TODO: appパーサーなのにリストを返すのは問題ないか？
              return Self.pure(Exp.list(List.empty()));
            case 1: 
              return Self.pure(Exp.app(List.head(items), Exp.variable("_")));
            case 2: 
              return Self.pure(Exp.app(List.head(items), List.at(items)(1)));
            case 3: 
              // Exp.app(Exp.app(plus,Exp.atom(1)), Exp.atom(2))
              return Self.pure(
                Exp.app(
                  Exp.app(List.head(items), List.at(items)(1)),
                  List.at(items)(2))
              );
            default: // 2項以上の引数がある場合
              throw new Error("引数が3個以上には未対応")
          }
        });
      });
    })(input);
  },
  // list = "(" s_expression < s_expression > ")"
  list: (input) => {
    const quote = Self.char("'"),
      open = Self.char("("),
      close = Self.char(")");
    return Self.flatMap(quote)(_ => {
      return Self.flatMap(open)(_ => {
        return Self.flatMap(Self.many(Self.token(Self.expression)))(items=> {
          return Self.flatMap(close)(_ => {
            return Self.pure(Exp.list(items));
          });
        });
      });
    })(input);
  },
  // lambda
  /*
   * (lambda (仮引数) (演算式))
   * (lambda (x) (+ x 1)) 
   *
   */
  lambda: (input) => {
    const open = Self.token(Self.char("(")),
      close = Self.token(Self.char(")")),
      comma = Self.token(Self.char(","));
    const argument = (input) => {
      return Self.bracket(open, Self.identifier(List.empty()), close)(input);
    };
    return Self.flatMap(open)(_ => {
      // lambda
      return Self.flatMap(Self.token(Self.chars(List.fromString("lambda"))))(_ => {
        return Self.flatMap(argument)(arg => {
          return Self.flatMap(Self.expression)(body => {
            return Self.flatMap(close)(_ => {
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

module.exports = Self;
