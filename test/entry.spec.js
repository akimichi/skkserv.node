'use strict';

const expect = require('expect.js'),
  should = require('should'),
  mongoose = require('mongoose'),
  Entry = require('../models/entry.js');

const factories = require("./factories.js"),
  entries = factories.entries();

const helper = require('./helper.js');

describe('Entry model', () => {
  const entry = entries.tatsukawa;

  after(done => {
    entry.remove()
      .then(() => {
        done(); 
      })
      .catch((error) => {
        done(error);  
      });
  });

  it('should be able to save without errors', (done) => {
    entry.save((err, document) => {
      should.not.exist(err);
      expect(document.yomi).to.equal("たつかわ")
      done();
    });

  });
});
