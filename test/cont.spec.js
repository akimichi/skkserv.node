"use strict";

const expect = require('expect.js'),
  Cont = require('../lib/cont.js');

describe("'Cont' monad module", () => {
  describe("Cont#unit", () => {
    it('div', (next) => {
      const succ = (n) => {
        return n + 1;
      };
      const succCPS =  Cont.unit(succ);
      expect(
        succCPS(Cont.stop)(4)
      ).to.eql(
        16 
      );
      next();
    });
  });

});
