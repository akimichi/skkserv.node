'use strict';

process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');

const expect = require('expect.js'),
  should = require('should');

const Entry = require('../models/entry.js');

const factories = require("./factories.js"),
  entries = factories.entries();

const helper = require('./helper.js');

describe('Entry model', () => {
  const entry = entries.tatsukawa;

  before(async () => {
    await Entry.deleteOne({ yomi: entry.yomi });
  });

  it('should be able to save without errors', function (done) {
    this.timeout('5s');
    entry.save()
      .then(document => {
        // should.not.exist(err);
        expect(document.yomi).to.equal("たつかわ")
        done();
      })
  });
  describe('Entry#henkan', () => {
    it('should be able to henkan', async () => {
      const candidates = ["愛","藍","相"];
      const ai = new Entry({
        yomi: 'あい',
        candidates: candidates
      });
      const document = await ai.save();
      expect(document.yomi).to.equal("あい");
      const response = await Entry.henkan('あい');
      console.log(response);
      expect(response[0]).to.equal("愛");
    });
    it('lispを使う', async function() {
      this.timeout('5s');
      const response1 = await Entry.runLisp('(succ 9)');
      expect(response1).to.equal(10);
      const response2 = await Entry.runLisp('(BMI 70 1.75)');
      expect(response2).to.equal(22.857142857142858);
    });
  });
});
