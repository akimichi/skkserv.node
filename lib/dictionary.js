'use strict';

const fs = require('fs');
const iconvLite = require('iconv-lite');

const Either = require('kansuu.js').either;

const Interpreter = require('./lisp/interpreter.js'),
  Env = require('./lisp/env.js'),
  preludeEnv = Env.prelude(Env.empty);

// メモリ辞書: Map<string, string[]>
const dictionary = new Map();

/**
 * 辞書ファイルを読み込んでMapに格納
 * @param {string} path - 辞書ファイルのパス
 */
const loadFile = (path) => {
  const content = fs.readFileSync(path);
  const lines = iconvLite.decode(content, "EUC-JP").toString().split("\n");

  lines.forEach((line) => {
    if (/^;;.+$/.test(line) === false) {
      const regex = /^(\S+)\s\/([^\/].+)\//;
      const matchResult = line.match(regex);

      if (matchResult) {
        const yomi = matchResult[1];
        const candidates = matchResult[2].split('/');

        // 既存のエントリがあれば候補をマージ
        if (dictionary.has(yomi)) {
          const existing = dictionary.get(yomi);
          const merged = [...new Set([...existing, ...candidates])];
          dictionary.set(yomi, merged);
        } else {
          dictionary.set(yomi, candidates);
        }
      }
    }
  });
};

/**
 * 複数の辞書ファイルを読み込む
 * @param {string[]} paths - 辞書ファイルパスの配列
 */
const load = (paths) => {
  paths.forEach((path) => {
    console.log(`loading ${path}`);
    loadFile(path);
  });
  console.log(`Dictionary loaded: ${dictionary.size} entries`);
};

/**
 * 読みから候補を検索
 * @param {string} yomi - 読み
 * @returns {Promise<string[]>}
 */
const henkan = async (yomi) => {
  const candidates = dictionary.get(yomi);
  if (candidates) {
    return candidates;
  }
  throw yomi;
};

/**
 * Lisp式を評価
 * @param {string} yomi - Lisp式
 * @returns {Promise<any>}
 */
const runLisp = (yomi) => {
  return new Promise((resolve, reject) => {
    Either.match(Interpreter.run(yomi)(preludeEnv), {
      right: (value) => {
        resolve(value);
      },
      left: (errMessage) => {
        reject(errMessage);
      },
    });
  });
};

/**
 * 辞書をクリア（テスト用）
 */
const clear = () => {
  dictionary.clear();
};

/**
 * エントリを追加（テスト用）
 * @param {string} yomi
 * @param {string[]} candidates
 */
const add = (yomi, candidates) => {
  dictionary.set(yomi, candidates);
};

/**
 * 辞書サイズを取得
 * @returns {number}
 */
const size = () => {
  return dictionary.size;
};

module.exports = {
  load,
  henkan,
  runLisp,
  clear,
  add,
  size,
};
