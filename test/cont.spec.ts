import expect = require('expect.js');
import Cont = require('../lib/cont');

describe("'Cont' monad module", () => {
  describe("Cont#unit", () => {
    it('div', (next) => {
      const succ = (n: number): number => {
        return n + 1;
      };
      const succCPS = Cont.unit(succ);
      expect(
        succCPS(Cont.stop)(4)
      ).to.eql(
        5
      );
      next();
    });
  });
});
