"use strict";

const exp = require('./exp.js'),
  ID = require('./monad.js').ID;

module.exports = {
  /* 空の環境を作る */
  /* empty:: STRING => VALUE */
  empty: (variable) => {                        
    return undefined;
  },
  /* 変数名に対応する値を環境から取り出す */
  /* lookup:: (STRING, ENV) => VALUE */
  lookup : (name, environment) => {       
    return environment(name);
  },
  /* 環境を拡張する */
  /* extend:: (STRING, VALUE, ENV) => ENV */
  extend: (identifier, value, environment) => { 
    return (queryIdentifier) => {
      if(identifier === queryIdentifier) {
        return value;
      } else {
        return lookup(queryIdentifier,environment);
      }
    };
  }
};
