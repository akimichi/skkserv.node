process.env.NODE_ENV = 'test';

import expect = require('expect.js');
import dictionary = require('../lib/dictionary');

describe('Dictionary module', () => {
  beforeEach(() => {
    dictionary.clear();
  });

  describe('add と henkan', () => {
    it('追加したエントリを検索できる', async () => {
      const candidates = ['愛', '藍', '相'];
      dictionary.add('あい', candidates);

      const response = await dictionary.henkan('あい');
      expect(response[0]).to.equal('愛');
      expect(response[1]).to.equal('藍');
      expect(response[2]).to.equal('相');
    });

    it('存在しない読みはエラーをthrowする', async () => {
      try {
        await dictionary.henkan('そんざいしない');
        expect().fail('should throw');
      } catch (err) {
        expect(err).to.equal('そんざいしない');
      }
    });
  });

  describe('runLisp', () => {
    it('Lisp式を評価できる', async function () {
      this.timeout('5s');
      const result = await dictionary.runLisp('(succ 9)');
      expect(result).to.equal(10);
    });

    it('BMI計算ができる', async function () {
      this.timeout('5s');
      const result = await dictionary.runLisp('(BMI 70 1.75)');
      expect(result).to.equal(22.857142857142858);
    });
  });

  describe('runArith', () => {
    it('四則演算を評価できる', async function () {
      this.timeout('5s');
      const result = await dictionary.runArith('1 + 2');
      expect(result).to.equal(3);
    });
    it('演算子の優先順位が正しい', async function () {
      this.timeout('5s');
      const result = await dictionary.runArith('1 + 2 * 3');
      expect(result).to.equal(7);
    });
    it('括弧で優先順位を変更できる', async function () {
      this.timeout('5s');
      const result = await dictionary.runArith('(1 + 2) * 3');
      expect(result).to.equal(9);
    });
    it('ゼロ除算はエラーになる', async function () {
      this.timeout('5s');
      try {
        await dictionary.runArith('1 / 0');
        expect().fail('should throw');
      } catch (err) {
        expect(err).to.equal('ゼロで割ることはできません');
      }
    });
  });

  describe('load', () => {
    it('辞書ファイルを読み込める', function () {
      this.timeout('10s');
      dictionary.load(['./resource/SKK-JISYO.drug']);
      expect(dictionary.size()).to.be.greaterThan(0);
    });

    it('読み込んだ辞書から検索できる', async function () {
      this.timeout('10s');
      dictionary.load(['./resource/SKK-JISYO.drug']);
      const size = dictionary.size();
      expect(size).to.be.greaterThan(0);
    });
  });

  describe('size', () => {
    it('エントリ数を取得できる', () => {
      expect(dictionary.size()).to.equal(0);
      dictionary.add('あい', ['愛']);
      expect(dictionary.size()).to.equal(1);
      dictionary.add('かわ', ['川']);
      expect(dictionary.size()).to.equal(2);
    });
  });

  describe('clear', () => {
    it('辞書をクリアできる', () => {
      dictionary.add('あい', ['愛']);
      dictionary.add('かわ', ['川']);
      expect(dictionary.size()).to.equal(2);
      dictionary.clear();
      expect(dictionary.size()).to.equal(0);
    });
  });
});
