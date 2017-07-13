"use strict";

const expect = require('expect.js');

module.exports = {
  // ### 恒等モナド
  ID: {
    unit: (value) => {
      return value;
    },
    flatMap: (instance) => {
      return (transform) => {
        expect(transform).to.a('function');
        return transform(instance);
      };
    }
  }
};
