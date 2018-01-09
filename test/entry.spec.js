'use strict';

process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');
// mongoose.Promise = require('bluebird');

const expect = require('expect.js'),
  should = require('should');

const Entry = require('../models/entry.js');

const factories = require("./factories.js"),
  entries = factories.entries();

const helper = require('./helper.js');

describe('Entry model', () => {
  const entry = entries.tatsukawa;

  // before(done => {
  //   entry.remove()
  //     .then(() => {
  //       done(); 
  //     })
  //     .catch((error) => {
  //       done(error);  
  //     });
  // });

  it('should be able to save without errors', (done) => {
    this.timeout('15s');
    entry.save((err, document) => {
      should.not.exist(err);
      expect(document.yomi).to.equal("たつかわ")
      done();
    });
  });
  describe('Entry#henkan', () => {
    it('should be able to henkan', (done) => {
      const ai = new Entry({
        yomi: 'あい',
        candidates: ["愛","藍","相"]
      });
      ai.save((err, document) => {
        should.not.exist(err);
        Entry.henkan('あい', (err, response) => {
          expect(response).to.equal(
            '1/愛/藍/相/\n'
          )
          done();
        });
      });
    });
  });
});
