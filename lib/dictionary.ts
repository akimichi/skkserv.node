import fs = require('fs');
import iconvLite = require('iconv-lite');

const Either = require('kansuu.js').either;
import ArithInterpreter = require('./arith/interpreter');

import LispInterpreter = require('./lisp/interpreter');
import Env = require('./lisp/env');
const preludeEnv = Env.prelude(Env.empty);

const dictionary = new Map<string, string[]>();

const loadFile = (path: string): void => {
  const content = fs.readFileSync(path);
  const lines = iconvLite.decode(content, "EUC-JP").toString().split("\n");

  lines.forEach((line) => {
    if (/^;;.+$/.test(line) === false) {
      const regex = /^(\S+)\s\/([^\/].+)\//;
      const matchResult = line.match(regex);

      if (matchResult) {
        const yomi = matchResult[1];
        const candidates = matchResult[2].split('/');

        if (dictionary.has(yomi)) {
          const existing = dictionary.get(yomi)!;
          const merged = [...new Set([...existing, ...candidates])];
          dictionary.set(yomi, merged);
        } else {
          dictionary.set(yomi, candidates);
        }
      }
    }
  });
};

const load = (paths: string[]): void => {
  paths.forEach((path) => {
    console.log(`loading ${path}`);
    loadFile(path);
  });
  console.log(`Dictionary loaded: ${dictionary.size} entries`);
};

const henkan = async (yomi: string): Promise<string[]> => {
  const candidates = dictionary.get(yomi);
  if (candidates) {
    return candidates;
  }
  throw yomi;
};

const runLisp = (yomi: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    Either.match(LispInterpreter.run(yomi)(preludeEnv), {
      right: (value: any) => {
        resolve(value);
      },
      left: (errMessage: any) => {
        reject(errMessage);
      },
    });
  });
};

const runArith = (yomi: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    Either.match(ArithInterpreter.run(yomi), {
      right: (value: any) => {
        resolve(value);
      },
      left: (errMessage: any) => {
        reject(errMessage);
      },
    });
  });
};

const clear = (): void => {
  dictionary.clear();
};

const add = (yomi: string, candidates: string[]): void => {
  dictionary.set(yomi, candidates);
};

const size = (): number => {
  return dictionary.size;
};

export = {
  load,
  henkan,
  runLisp,
  runArith,
  clear,
  add,
  size,
};
