'use strict';

process.env.NODE_ENV = 'test';

const expect = require('expect.js');
const dictionary = require('../lib/dictionary.js');

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
    it('Lisp式を評価できる', async function() {
      this.timeout('5s');
      const result = await dictionary.runLisp('(succ 9)');
      expect(result).to.equal(10);
    });

    it('BMI計算ができる', async function() {
      this.timeout('5s');
      const result = await dictionary.runLisp('(BMI 70 1.75)');
      expect(result).to.equal(22.857142857142858);
    });
  });

  describe('load', () => {
    it('辞書ファイルを読み込める', function() {
      this.timeout('10s');
      // 小さい辞書ファイルでテスト
      dictionary.load(['./resource/SKK-JISYO.drug']);
      expect(dictionary.size()).to.be.greaterThan(0);
    });

    it('読み込んだ辞書から検索できる', async function() {
      this.timeout('10s');
      dictionary.load(['./resource/SKK-JISYO.drug']);
      // 医薬品辞書には薬品名が含まれている
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
