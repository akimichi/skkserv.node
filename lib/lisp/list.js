"use strict";

var expect = require('expect.js');
var Data = require('./data.js');

// リストモジュール
// =============


const type = (pattern) => {
  return pattern.list();    
};

const match = (data,pattern) => {
  return pattern(data);    
};

const empty = (_) => {
  return {
    type: (pattern) => {
      return pattern.list();
    },
    match: (pattern) => {
      return pattern.empty();
    }
  };
};

const cons = (head, tail) => {
  return {
    type: (pattern) => {
      return pattern.list();
    },
    match: (pattern) => {
      return pattern.cons(head, tail);
    }
  };
};

const unit = (value) => {
  var self = this;
  return cons(value, empty());
};

const head = (data) => {
  return data.match({
    empty: (_) => {
      return null;
    },
    cons: (head, tail) => {
      return head;
    }
  });
};

const tail = (data) => {
  return data.match({
    empty: (_) => {
      return null;
    },
    cons: (head, tail) => {
      return tail;
    }
  });
};

const isEmpty = (list) => {
  return list.match({
    empty: (_) => {
      return true;
    },
    cons: (head, tail) => {
      return false;
    }
  });
};

const isEqual = (xs, ys) => {
  var self = this;
  if(isEmpty(xs)) {
    if(isEmpty(ys)) {
      return true;
    } else {
      return false;        
    }
  } else {
    if(isEmpty(ys)) {
      return false;
    } else {
      return xs.match({
        empty: (_) => {
          return false;
        },
        cons: (x, xtail) => {
          return ys.match({
            empty: (_) => {
              return false;
            },
            cons: (y, ytail) => {
              if(x === y) {
                return isEqual(xtail, ytail);
              } else {
                return false;
              }
            }
          });
        }
      });
    }
  }
};

  // ### monad.list#flatten
  // ~~~haskell
  // flatten :: [[a]] -> [a]
  // flatten =  foldr (++) []
  // ~~~
const flatten = (instanceMM) => {
  var self = this;
  return instanceMM.match({
    empty: (_) => {
      return empty();
    },
    cons: (head,tail) => {
      return append(head)(flatten(tail));
    }
  });
};
  // map:: LIST[T] -> FUNC[T -> T] -> LIST[T]
  // map: (alist) => {
  //   var self = this;
  //   return (transform) => {
  //     return this.match(alist,{
  //       empty: (_) => {
  //         return this.empty();
  //       },
  //       cons: (head,tail) => {
  //         return this.cons(transform(head),this.map(tail)(transform));
  //       }
  //     });
  //   };
  // },
  // ### List#map
const map = (instanceM) => {
  var self = this;
  return (transform) => {
    // return self.match(instanceM,{
    return instanceM.match({
      empty: (_) => {
        return empty();
      },
      cons: (head,tail) => {
        return cons(transform(head),
          map(tail)(transform));
      }
    });
  };
};

// ### monad.list#flatMap
const flatMap = (instanceM) => {
  var self = this;
  return (transform) => { // FUN[T->LIST[T]]
    return flatten(map(instanceM)(transform));
  };
};
// append:: LIST[T] -> LIST[T] -> LIST[T]
// append [] ys = ys
// append (x:xs) ys = x : (xs ++ ys)
const append =  (xs) => {
  var self = this;
  return (ys) => {
    return xs.match({
      empty: (_) => {
        return ys;
      },
      cons: (head, tail) => {
        return cons(head, append(tail)(ys)); 
      }
    });
  };
};
// list#concat
// concat:: LIST[LIST[T]] -> LIST[T]
// concat [] = []
// concat (xs:xss) = append(xs, xss)
// or,
// concat xss = foldr xss [] append
const concat = (xss) => {
  var self = this;
  return xss.match({
    empty: (_) => {
      return this.empty();
    },
    cons: (xs,xss) => {
      return this.append(xs)(xss);
    }
  });
};

const last = (alist) => {
  var self = this;
  return alist.match({
    empty: (_) => {
      return null;
    },
    cons: (head, tail) => {
      return tail.match({
        empty: (_) => {
          return head;
        },
        cons: (head, _) => {
          return last(tail);
        }
      });
    }
  });
};
// join:: LIST[LIST[T]] -> LIST[T]
const join = (list_of_list) => {
  return this.concat(list_of_list);
};
// foldr:: LIST[T] -> T -> FUNC[T -> LIST] -> T
const foldr = (alist) => {
  var self = this;
  return (accumulator) => {
    return (glue) => {
      expect(glue).to.a('function');
      // return Data.match({
      return alist.match({
        empty: (_) => {
          return accumulator;
        },
        cons: (head, tail) => {
          return glue(head)(foldr(tail)(accumulator)(glue));
        }
      });
    };
  };
};

const any = (alist) => {
  var self = this;
  var or = (alist) => {
    return alist.match({
      empty: (_) => {
        return false;
      },
      cons: (head, tail) => {
        return head || or(tail);
      }
    });
  };
  return (predicate) => {
    return or(map(alist)(predicate));
  };
  // return (predicate) => {
  //   expect(predicate).to.a('function');
  //   return alist.match({
  //     empty: (_) => {
  //       return false;
  //     },
  //     cons: (head,tail) => {
  //       if(predicate(head)) {
  //         return true;
  //       } else {
  //         return self.any(tail)(predicate);
  //       }
  //     }
  //   });
  // };
};
// elem x xs = any (==x) xs
const elem = (alist) => {
  var self = this;
  var isEqual = (x) => {
    return (y) => {
      return x === y;
    };
  };
  return (item) => {
    return any(alist)(isEqual(item));
  };
};
const fromArray = (array) => {
  var self = this;
  expect(array).to.an('array');
  return array.reduce((accumulator, item) => {
    return append(accumulator)(cons(item, empty()));
  }, empty());
};
const toArray = (alist) => {
  var toArrayAux = (alist,accumulator) => {
    return alist.match({
      empty: (_) => {
        return accumulator;  // 空のリストの場合は終了
      },
      cons: (head, tail) => {
        return toArrayAux(tail, accumulator.concat(head));
      }
    });
  };
  return toArrayAux(alist, []);
};
// list#length
const length = (alist) => {
  var self = this;
  return foldr(alist)(0)((_) => {
    return (accumulator) => {
      return 1 + accumulator;
    };
  });
  // return alist.match({
  //   empty: (_) => {
  //     return 0;
  //   },
  //   cons: (head,tail) => {
  //     return self.foldr(alist)(0)((item) => {
  //       return (accumulator) => {
  //         return 1 + accumulator;
  //       };
  //     });
  //   }
  // });
};
// list#filter
const filter = (alist) => {
  var self = this;
  return (predicate) => {
    return alist.match({
      empty: (_) => {
        return empty();
      },
      cons: (head,tail) => {
        if(predicate(head) === true){
          return cons(head, filter(tail)(predicate));
        } else {
          return filter(tail)(predicate);
        }
      }
    });
  };
};
const fromString = (str) => {
  expect(str).to.a('string');
  if(str.length === 0) {
    return empty();
  } else {
    var head = str[0];
    var tail = str.substring(1);
    return cons(head, fromString(tail));
  }
};

const toString = (aList) => {
  if(length(aList) === 0) {
    return "";
  } else {
    return head(aList) + toString(tail(aList));
  }
};

module.exports = {
  type: type,
  match: match,
  empty: empty,
  cons: cons, 
  unit: unit, 
  head: head,
  tail: tail,
  isEmpty: isEmpty,
  isEqual: isEqual,
  flatten: flatten,
  map: map,
  flatMap: flatMap,
  append: append,
  concat: concat,
  last: last,
  join: join,
  foldr: foldr,
  any: any,
  elem: elem,
  fromArray: fromArray,
  toArray: toArray,
  length: length,
  filter: filter,
  fromString: fromString,
  toString: toString
};
