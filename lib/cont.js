"use strict;"

const NodeCont = {
  unit: (arg) => (cont) => {
    return cont(null, arg);
  },
  fail: (err) => (cont) => {
    return cont(err,null);
  },
  // m:: a 
  // f:: a -> Cont r a
  flatMap: (m) => (f) => (cont) => {
    return m((err, value) => {
      return f(err, value)(cont);
    });
  },
  stop: (err, value) => {
    if(err) {
      throw new Error(err);
    } else {
      return value;
    }
  },
  // ~~~haskell
  // class Monad m => MonadCont m where
  //   callCC :: ((a -> m a) -> m a) -> m a
  // instance MonadCont (Cont r) where
  //   callCC f = Cont $ \k -> runCont (f (\a -> Cont $ \_ -> k a)) k
  //   -- i.e.  callCC f = \k -> ((f (\a -> \_ -> k a)) k)
  // ~~~
  callCC: (f) => (cont) => { 
    return f((err, value) => {
      return (_) => {
        return cont(err, value);
      }; 
    })(cont);
  }
};

module.exports = NodeCont;

