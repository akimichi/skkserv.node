"use strict";

const exp = require('./exp.js'),
  ID = require('kansuu.js').monad.identity;


/* 空の環境を作る */
/* empty:: STRING => VALUE */
const empty = (variable) => {
  return undefined;
};
/* 変数名に対応する値を環境から取り出す */
/* lookup:: (STRING, ENV) => VALUE */
const lookup = (name, environment) => {
  return environment(name);
};
/* 環境を拡張する */
/* extend:: (STRING, VALUE, ENV) => ENV */
const extend = (identifier, value, environment) => {
  return (queryIdentifier) => {
    if(identifier === queryIdentifier) {
      return value;
    } else {
      return lookup(queryIdentifier,environment);
    }
  };
};

module.exports = {
  /* 空の環境を作る */
  empty: empty,
  /* 変数名に対応する値を環境から取り出す */
  lookup : lookup, 
  /* 環境を拡張する */
  extend: extend
};
