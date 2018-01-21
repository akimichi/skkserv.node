"use strict";

const expect = require('expect.js'),
 Pair = require('kansuu.js').pair,
 List = require('kansuu.js').monad.list,
 ID = require('kansuu.js').monad.identity;

const exp = require('./exp.js'),
  env = require('./env.js');

const Self = {
  // pure :: a -> Parser a
  //
  // ~~~
  //  pure v = \inp -> [(v, inp)]
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
  apply: (pg) => {
    return (px) => {
      return (input) => {
        return List.match(parse(pg)(input),{
          empty: () => {
            return List.empty();
          },
          cons: (pair,_) => {
            return Pair.match(pair,{
              cons: (g, out) => {
                return parse(fmap(g)(px))(out);
              }
            });
          }
        });
      };
    };
  },
  // flatMap :: Parser a -> (a -> Parser b) -> Parser b
  flatMap: (parser) => {
    return (f) => {
      return (input) => {
        return List.match(Self.parse(parser)(input),{
          empty: () => {
            return List.empty();
          },
          cons: (pair,_) => {
            return Pair.match(pair,{
              cons: (v, out) => {
                return Self.parse(f(v))(out);
              }
            });
          }
        });
      };
    };
  },
  // fmap :: (a -> b) -> Parser a -> Parser b
  fmap: (f) => {
    return (parserA) => {
      return (input) => {
        return List.match(Self.parse(parserA)(input), {
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
    };
  },
  // parse :: Parser a -> String -> [(a,String)]
  // parse parser input = parser(input)
  parse: (parser) => {
    return (input) => {
      return parser(input);
    };
  },
  // item :: Parser String
  item: (input) => {
    return List.match(input,{
      empty: (_) => {
        return List.empty();
      },
      cons: (head, tail) => {
        return List.cons(Pair.cons(head, tail),
            List.empty()); 
      }
    });
  },
  // sat :: (String -> Bool) -> Parser String
  sat: (predicate) => {
    return Self.flatMap(Self.item)((x) => {
      if(predicate(x) === true) {
        return Self.pure(x);
      } else {
        return Self.empty;
      }
    });
  },
  // alt :: Parser a -> Parser a -> Parser b
  alt: (parserA,parserB) => {
    return (input) => {
      return List.match(Self.parse(parserA)(input),{
        empty: () => {
          return Self.parse(parserB)(input);
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
  // many :: f a -> f [a]
  many: (x) => {
    return Self.alt(Self.some(x), Self.pure(List.empty()));
  },
  // some :: f a -> f [a]
  some: (x) => {
    return Self.flatMap(x)((a) => {
      return Self.flatMap(Self.many(x))((b) => {
        return Self.pure(List.cons(a,b));
      });
    }); 
  },
  // digit :: Parser String 
  digit: () => { 
    var isDigit = (x) => {
      return !isNaN(x);
    };
    return Self.sat(isDigit);
  },
  // lower :: Parser String 
  lower: () => { 
    var isLower = (x) => {
      if(x.match(/^[a-z]/)){
        return true;
      } else {
        return false;
      } 
    };
    return Self.sat(isLower);
  },
  // upper :: Parser String 
  upper: () => { 
    var isUpper = (x) => {
      if(x.match(/^[A-Z]/)){
        return true;
      } else {
        return false;
      } 
    };
    return Self.sat(isUpper);
  },
  // letter :: Parser Char
  letter: () => { 
    var isAlpha = (x) => {
      if(x.match(/^[a-zA-Z]/)){
        return true;
      } else {
        return false;
      } 
    };
    return sat(isAlpha);
  },
  // alphanum :: Parser Char
  // > Parses a letter or digit (a character between '0' and '9'). Returns the parsed character.
  alphanum: () => { 
    var isAlphaNum = (x) => {
      if(x.match(/^[a-zA-Z0-9]/)) {
        return true;
      } else {
        return false;
      } 
    };
    return Self.sat(isAlphaNum);
  },
  // char :: Char -> Parser Char
  char: (x) => { 
    var isX = (input) => {
      if(x === input){
        return true;
      } else {
        return false;
      }
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
  ident: () => {
    return Self.flatMap(Self.lower())((x) => {
      return Self.flatMap(Self.many(Self.alphanum()))((xs) => {
        return Self.pure(Symbol(List.toString(List.cons(x,xs))));
        //return pure(List.cons(x,xs));
      });
    });
  },
  nat: () => {
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
    return Self.flatMap(Self.some(Self.digit()))(xs => {
      return Self.pure(read(xs));
    });
  },
  space: () => {
    var isSpace = (x) => {
      if(x.match(/^[ \t]/)) {
        return true;
      } else {
        return false;
      } 
    };
    return Self.flatMap(Self.many(Self.sat(isSpace)))((_) => {
      return Self.pure(Pair.empty());
    });
  },
  int: () => {
    return Self.alt(
        Self.flatMap(Self.char("-"))((_) => {
          return Self.flatMap(Self.nat())((n) => {
            return Self.pure(-n);
          });
        })
        ,Self.nat()
        );
  },
  float: () => {
    var minus = Self.char("-");
    var dot = Self.char(".");
    return Self.alt(
        Self.flatMap(minus)((_) => {
          return Self.flatMap(Self.nat())((n) => {
            return Self.flatMap(dot)((_) => {
              return Self.flatMap(Self.nat())((m) => {
                return Self.pure(-n - m * (1 / Math.pow(10, Math.floor(1+Math.log10(m))) ));
              });
            });
          });
        })
        ,Self.flatMap(Self.nat())((n) => {
          return Self.flatMap(dot)((_) => {
            return Self.flatMap(Self.nat())((m) => {
              return Self.pure(n + m * (1 / Math.pow(10, Math.floor(1+Math.log10(m))) ));
            });
          });
        })
        );
  },
  // token :: Parser a -> Parser a
  token: (parser) => {
    return Self.flatMap(Self.space())((_) => {
      return Self.flatMap(parser)((v) => {
        return Self.flatMap(Self.space())((_) => {
          return Self.pure(v);
        });
      });
    });
  },
  identifier: () => {
    return Self.token(Self.ident());
  },
  natural: () => {
    return Self.token(Self.nat());
  },
  integer: () => {
    return Self.token(Self.int());
  },
  numeric: () => {
    const toExp = (value) => {
      return exp.num(value);
    };
    return Self.fmap(toExp)(Self.token(Self.alt(Self.float(), Self.int())));
    // return flatMap(token(alt(float(), int())))(numericValue => {
    //   return pure(exp.num(numericValue));
    // });
  },
  boolean: () => {
    const t = List.fromString("#t");
    const f = List.fromString("#f");
    return Self.flatMap(Self.token(Self.alt(Self.chars(t), Self.chars(f))))(v => {
      switch(v) { 
        case "#t": 
          return Self.pure(exp.bool(true));
          // return pure(true);
        case "#f": 
          return Self.pure(exp.bool(false));
          // return pure(false);
      }
    });
  },
  string: () => {
    const quote = Self.char('"');
    const stringContent = () => {
      const notQuote = (x) => {
        if(x.match(/^"/)){
          return false;
      } else {
        return true;
      } 
      // if(x.match(/^[^"]+/)){
      //   return true;
      // } else {
      //   return false;
      // } 
      };
      return Self.flatMap(Self.many(Self.sat(notQuote)))((xs) => {
        return Self.pure(List.toString(xs));
      });
    };
    return Self.token(
        Self.flatMap(quote)((x) => {
          return Self.flatMap(stringContent())((xs) => {
            return Self.flatMap(quote)((_) => {
              return Self.pure(exp.string(xs));
              // return pure(xs);
            });
          });
        })
        );
  },
  symbol: (xs) => {
    return Self.token(Self.chars(xs));
  }
};


// const sexp = () => {
//   const parenL = char('(');
//   const parenR = char(')');
//   flatMap(parenL)((_) => {
//     return flatMap(sexpBody())((body) => {
//       return flatMap(parenR)((_) => {
//         return pure(body);
//       });
//     });
//   )
//   return alt(
//     identifier()
//     ,alt(
//       numeric()
//       ,alt(
//         string()
//         , boolean()
//       )
//     ) 
//   );
// };

// const sexpBody = () => {
//   return flatMap(identifier())((variable) => {
//     flatMap(many(sexp))((parameters) => {
//       return   
//     })
//   );
// };

// module.exports = {
//   pure: pure,
//   apply: apply,
//   flatMap: flatMap,
//   empty: empty,
//   alt: alt,
//   parse: parse,
//   fmap: fmap,
//   item: item,
//   sat: sat,
//   digit: digit,
//   lower: lower,
//   upper: upper,
//   letter: letter,
//   alphanum: alphanum,
//   char: char,
//   chars: chars,
//   // stringContent: stringContent,
//   string: string,
//   many: many,
//   some: some,
//   ident: ident,
//   nat: nat,
//   space: space,
//   int: int,
//   float: float,
//   token: token,
//   identifier: identifier,
//   natural: natural,
//   integer: integer,
//   numeric: numeric,
//   symbol: symbol,
//   boolean: boolean,
//   // sexp: sexp
// };
module.exports = Self;
