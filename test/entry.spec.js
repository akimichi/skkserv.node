'use strict';

process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const expect = require('expect.js'),
  should = require('should');

const Entry = require('../models/entry.js');

const factories = require("./factories.js"),
  entries = factories.entries();

const helper = require('./helper.js');

describe('Entry model', () => {
  const entry = entries.tatsukawa;

  before(done => {
    entry.remove()
      .then(() => {
        done(); 
      })
      .catch(err => {
        done(err);  
      });
      // done();
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
    it('should be able to henkan', (done) => {
      const candidates = ["愛","藍","相"];
      const ai = new Entry({
        yomi: 'あい',
        candidates: candidates
      });
      ai.save()
        .then(document => {
          // should.not.exist(err);
          expect(document.yomi).to.equal("あい")
          Entry.henkan('あい', (err, response) => {
            console.log(response)
            expect(response[0]).to.equal("愛")
            done();
          });
        })
      // ai.save((err, document) => {
      //   should.not.exist(err);
      //   Entry.henkan('あい', (err, response) => {
      //     expect(response).to.equal(
      //       '1/愛/藍/相/\n'
      //     )
      //     done();
      //   });
      // })
    });
    it('lispを使う', function(done) {
      this.timeout('5s');
      Entry.runLisp('(succ 9)', (err, response) => {
        expect(response).to.equal(10)
      });
      Entry.runLisp('(BMI 70 1.75)', (err, response) => {
        expect(response).to.equal(22.857142857142858)
      });
      done();
      // const succ = new Entry({
      //   yomi: '(succ)',
      //   candidates: ["(lambda (x) (succ x))"]
      // });
      // succ.save()
      //   .then(document => {
      //     // should.not.exist(err);
      //     expect(document.yomi).to.equal("あい")
      //     Entry.henkan('あい', (err, response) => {
      //       expect(response).to.equal('1/愛/藍/相/\n')
      //       done();
      //     });
      //   })
    });
  });
});
