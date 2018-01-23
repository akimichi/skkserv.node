"use strict";

const expect = require('expect.js'),
  Pair = require('kansuu.js').pair,
  List = require('kansuu.js').monad.list,
  Parser = require('../../lib/lisp/parser.js');

describe('パーサーコンビネーター', () => {
  var abc = List.fromString("abc");
  describe("Parserモナド", (next) => {
    it("pure", (next) => {
      expect(
        List.toArray(
          List.head(
            Parser.parse(Parser.pure(1))(abc)
          ))
      ).to.eql(
        ['1', 'a','b','c']
      );
      expect(
        Pair.left(
          List.head(
            Parser.parse(Parser.pure(1))(abc)
          ))
      ).to.eql(
        '1'
      );
      expect(
        List.toArray(Pair.right(
          List.head(
            Parser.parse(Parser.pure(1))(abc)
          )))
      ).to.eql(
        ['a','b','c']
      );
      // expect(
      //   PP.print(Parser.parse(Parser.pure(1))(abc))
      // ).to.eql(
      //   '[(1,[a,b,c,nil]),nil]'
      // );
      next();
    });
    it("result", (next) => {
      expect(
        List.toArray(
          List.head(
            Parser.parse(Parser.result(1))(abc)
          ))
      ).to.eql(
        ['1', 'a','b','c']
      );
      next();
    });
    it("emptyは常にパースを失敗させる", (next) => {
      var input = List.fromString("abc");
      expect(
        List.toArray(
          Parser.parse(Parser.empty)(input)
        )
      ).to.eql(
        []
      );
      next();
    });
    it("zeroは常にパースを失敗させる", (next) => {
      const input = List.fromString("abc");
      expect(
        List.toArray(Parser.parse(Parser.zero)(input))
      ).to.eql(
        []
      );
      next();
    });
    describe("fmap", (next) => {
      it("toUpper", (next) => {
        var input = List.fromString("abc");
        var toUpper = (s) => {
          return s.toUpperCase();
        };
        expect(
          List.toArray(
            List.head(
              Parser.parse(Parser.fmap(toUpper)(Parser.item))(input)
            ))
        ).to.eql(
          ['A','b','c'] // '[(A,[b,c,nil]),nil]'
        );
        next();
      });
    });
    describe("flatMap", (next) => {
      // it("flatMapの単純な使用", (next) => {
      //   var input = List.fromString("  +  ");
      //   var add_or_subtract = Parser.alt(Parser.symbol(List.fromString("+")), Parser.symbol(List.fromString("-")));
      //   var parser = Parser.flatMap(add_or_subtract)((operator) => {
      //     return Parser.pure(operator);
      //   });
      //   expect(
      //     // PP.print(
      //     List.toArray(
      //       List.head(
      //         Parser.parse(parser)(input)
      //       )
      //     )
      //   ).to.eql(
      //     ['+']
      //     // '[(+,[]),nil]'
      //   );
      //   next();
      // });
      it("flatMapを組み合わせる", (next) => {
        var input = List.fromString("abcdef");
        var three = Parser.flatMap(Parser.item)((x) => {
          return Parser.flatMap(Parser.item)((_) => {
            return Parser.flatMap(Parser.item)((z) => {
              return Parser.pure(Pair.cons(x,z));
            });
          });
        });
        expect(
          Pair.toArray(
            Pair.left(
              List.head(
                three(input)
              )))
        ).to.eql(
          ['a','c'] // '[((a,c),[d,e,f,nil]),nil]'
        );
        next();
      });
    });
  }); // Parserモナド
  describe("parse関数", (next) => {
    it("itemは最初の一文字だけをパースする", (next) => {
      expect(
        List.isEmpty(
          Parser.item(List.empty())
        )
        // PP.print(Parser.item(List.empty()))
      ).to.eql(
        []
      );
      expect(
        Pair.left(
          List.head(
            Parser.parse(Parser.item)(List.fromString("abc"))
          ))
      ).to.eql(
        'a'
      );
      expect(
        List.toArray(Pair.right(
          List.head(
            Parser.parse(Parser.item)(List.fromString("abc"))
          )))
      ).to.eql(
        ['b','c']
      );
      next();
    });
    describe("派生したパーサー", (next) => {
      it("lower", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.lower
              )(List.fromString("abc"))
            ))
        ).to.eql(
          'a' //   '[(1,[2,3,nil]),nil]'
        );
        expect(
          List.toArray(Pair.right(
            List.head(
              Parser.parse(
                Parser.lower
              )(List.fromString("abc"))
            )))
        ).to.eql(
          ['b','c'] //   '[(1,[2,3,nil]),nil]'
        );
        next();
      });
      it("digit", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.digit
              )(List.fromString("123"))
            ))
        ).to.eql(
          '1' //   '[(1,[2,3,nil]),nil]'
        );
        expect(
          List.toArray(Pair.right(
            List.head(
              Parser.parse(
                Parser.digit
              )(List.fromString("123"))
            )))
        ).to.eql(
          ['2','3'] //   '[(1,[2,3,nil]),nil]'
        );
        // expect(
        //   List.head(
        //     Parser.parse(
        //       Parser.digit
        //     )(List.fromString(" "))
        //   )
        // ).to.eql(
        //   '1' //   '[(1,[2,3,nil]),nil]'
        // );
        next();
      });
      it("letter", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.letter
              )(List.fromString("abc123"))
            ))
        ).to.eql(
          ['a']
        );
        expect(
          List.toArray(Pair.right(
            List.head(
              Parser.parse(
                Parser.letter
              )(List.fromString("abc123"))
            )))
        ).to.eql(
          ['b','c','1','2','3']
        );
        next();
      });
      it("alphanum", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.alphanum
              )(List.fromString("123"))
            ))
        ).to.eql(
          ['1']
        );
        expect(
          List.toArray(Pair.right(
            List.head(
              Parser.parse(
                Parser.alphanum
              )(List.fromString("123"))
            )))
        ).to.eql(
          ['2','3']
        );
        next();
      });
      it("char", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.char("a")
              )(List.fromString("abcdef"))
            ))
        ).to.eql(
          'a'
        );
        next();
      });
      it("chars", (next) => {
        expect(
          List.toArray(
            List.head(
              Parser.parse(
                Parser.chars(List.fromString("abc"))
              )(List.fromString("abcdef"))
            ))
        ).to.eql(
          ['abc','d','e','f']
          // '[(abc,[d,e,f,nil]),nil]'
        );
        next();
      });
    });
    describe("alternative", (next) => {
      it("alt", (next) => {
        var input = List.fromString("abc");
        expect(
          // PP.print(
          List.toArray(
            List.head(
              Parser.parse(
                Parser.alt(Parser.item, Parser.pure("d"))
              )(input)
            ))
        ).to.eql(
          ['a','b','c']
          // '[(a,[b,c,nil]),nil]'
        );
        expect(
          List.toArray(
            List.head(
              Parser.parse(
                Parser.alt(Parser.empty, Parser.pure("d"))
              )(input)
            ))
        ).to.eql(
          ['d','a','b','c']
          // '[(d,[a,b,c,nil]),nil]'
        );
        next();
      });
    });
    describe("反復パーサ", (next) => {
      it("many digit", (next) => {
        expect(
          List.toArray(
            Pair.left(
              List.head(
                Parser.parse(
                  Parser.many(Parser.digit)
                )(List.fromString("123abc"))
              )))
        ).to.eql(
          ['1','2','3']
          // '[([1,2,3,nil],[a,b,c,nil]),nil]'
        );
        expect(
          List.toArray(
            Pair.left(
              List.head(
                Parser.parse(
                  Parser.many(Parser.digit)
                )(List.fromString("abc"))
              )))
        ).to.eql(
          []
          // '[([],[a,b,c,nil]),nil]'
        );
        next();
      });
      it("some digit", (next) => {
        expect(
          List.toArray(
            Parser.parse(
              Parser.some(Parser.digit)
            )(List.fromString("abc"))
          )
        ).to.eql(
          []
        );
        next();
      });
      it("sepby1", (next) => {
        const open = Parser.char("["),
          close = Parser.char("]"),
          comma = Parser.char(",");
        const ints = (input) => {
          return Parser.flatMap(open)(_ => {
            return Parser.flatMap(Parser.sepby1(Parser.int)(comma))(ns => {
              return Parser.flatMap(close)(_ => {
                return Parser.pure(ns);
              });
            });
          })(input);
        };
        expect(
          List.toArray(
            Pair.left(
              List.head(
                Parser.parse(
                  ints 
                )(List.fromString("[1,2,3]"))
              )))
        ).to.eql(
          [1,2,3]
        );
        next();
      });
    });
    it("ident", (next) => {
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.ident
            )(List.fromString("abc def"))
          ))
      ).to.eql(
        'abc'
        // 'Symbol(abc)'
        // '[(Symbol(abc),[ ,d,e,f,nil]),nil]'
      );
      next();
    });
    it("nat", (next) => {
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.nat
            )(List.fromString("123"))
          ))
      ).to.eql(
        123
      );
      next();
    });
    it("int", (next) => {
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.int
            )(List.fromString("-123 abc"))
          ))
      ).to.eql(
        -123
        // '[(-123,[a,b,c,nil]),nil]'
      );
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.int
            )(List.fromString("123 abc"))
          ))
      ).to.eql(
        123
      );
      next();
    });
    it("float", function(next) {
      this.timeout('5s')
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.float
            )(List.fromString("0.1"))
          ))
      ).to.eql(
        0.1
        // '[(0.1,[]),nil]'
      );
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.float
            )(List.fromString("0.123"))
          ))
      ).to.eql(
        0.123
        // '[(0.123,[]),nil]'
      );
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.float
            )(List.fromString("1.1"))
          ))
      ).to.eql(
        1.1
        // '[(1.1,[]),nil]'
      );
      expect(
        Pair.left(
          List.head(
            Parser.parse(
              Parser.float
            )(List.fromString("-1.1"))
          ))
      ).to.eql(
        -1.1
        // '[(-1.1,[]),nil]'
      );
      next();
    });
    it("spaces", (next) => {
      expect(
        List.toArray(Pair.right(
          List.head(
            Parser.parse(
              Parser.spaces
            )(List.fromString("   abc"))
          )))
      ).to.eql(
        ['a','b','c'] 
      );
      next();
    });
    describe("トークン", (next) => {
      it("identifier", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.identifier
              )(List.fromString("   abc"))
            )).toString()
        ).to.eql(
          'abc' // '[(Symbol(abc),[]),nil]'
        );
        next();
      });
      it("natural", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.natural
              )(List.fromString("   123   "))
            ))
        ).to.eql(
          123 // '[(123,[]),nil]'
        );
        next();
      });
      it("integer", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.integer
              )(List.fromString("   -123   "))
            ))
        ).to.eql(
          -123 // '[(-123,[]),nil]'
        );
        next();
      });
      it("numeric", function(next) {
        this.timeout('5s')
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.numeric
              )(List.fromString("   -123   "))
            )
          )({
            num: (value) => {
              return value;
            }
          })
        ).to.eql(
          -123 
        );
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.numeric
              )(List.fromString("   0.123   "))
            )
          )({
            num: (value) => {
              return value;
            }
          })
        ).to.eql(
          0.123
        );
        // expect(
        //   PP.print(
        //     Parser.parse(
        //       Parser.numeric()
        //     )(List.fromString("   -123   "))
        //   )
        // ).to.eql(
        //   '[(-123,[]),nil]'
        // );
        // expect(
        //   PP.print(
        //     Parser.parse(
        //       Parser.numeric()
        //     )(List.fromString("   0.123   "))
        //   )
        // ).to.eql(
        //   '[(0.123,[]),nil]'
        // );
        next();
      });
      it("boolean", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.boolean
              )(List.fromString("  #t  "))
            )
          )({
            bool: (value) => {
              return value;
            }
          })
        ).to.eql(
          true 
        );
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.boolean
              )(List.fromString("#f  "))
            )
          )({
            bool: (value) => {
              return value;
            }
          })
        ).to.eql(
          false 
        );
        // expect(
        //   PP.print(
        //     Parser.parse(
        //       Parser.boolean()
        //     )(List.fromString("  #t  "))
        //   )
        // ).to.eql(
        //   '[(true,[]),nil]'
        // );
        next();
      });
      it("symbol", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.symbol(List.fromString("+"))
              )(List.fromString("  +  "))
            ))
        ).to.eql(
          '+'
          // '[(+,[]),nil]'
        );
        next();
      });
      it("string", (next) => {
        expect(
          Pair.left(
            List.head(
              Parser.parse(
                Parser.string
              )(List.fromString("\"abc\""))
            )
          )({
            string: (value) => {
              return value;
            }
          })
        ).to.eql(
          "abc" 
        );
        // expect(
        //   PP.print(
        //     Parser.parse(
        //       Parser.string()
        //     )(List.fromString("\"abc\""))
        //   )
        // ).to.eql(
        //   '[(abc,[]),nil]'
        // );
        // expect(
        //   PP.print(
        //     Parser.parse(
        //       Parser.string()
        //     )(List.fromString("  \"abc\"  "))
        //   )
        // ).to.eql(
        //   '[(abc,[]),nil]'
        // );
        // expect(
        //   PP.print(
        //     Parser.parse(
        //       Parser.string()
        //     )(List.fromString("  \"  abc  \"  "))
        //   )
        // ).to.eql(
        //   '[(  abc  ,[]),nil]'
        // );
        next();
      });
    });
    describe("S式", (next) => {
      // it("sexp", (next) => {
      //   expect(
      //     PP.print(
      //       Parser.parse(
      //         Parser.sexp()
      //       )(List.fromString("0.12"))
      //     )
      //   ).to.eql(
      //     '[(0.12,[]),nil]'
      //   );
      //   expect(
      //     PP.print(
      //       Parser.parse(
      //         Parser.sexp()
      //       )(List.fromString("#f"))
      //     )
      //   ).to.eql(
      //     '[(false,[]),nil]'
      //   );
      //   expect(
      //     PP.print(
      //       Parser.parse(
      //         Parser.sexp()
      //       )(List.fromString("\"a string\""))
      //     )
      //   ).to.eql(
      //     '[(a string,[]),nil]'
      //   );
      //   next();
      // });
    });
  });

});

