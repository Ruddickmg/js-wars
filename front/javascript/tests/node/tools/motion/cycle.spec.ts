import {expect} from "chai";
import range from "../../../../src/tools/array/range";
import cycle, {Cycle} from "../../../../src/tools/motion/cycle";

describe("cycle", () => {

  const beginning: number = -2;
  const end: number = 100;
  const firstIndex: number = 0;
  const cycler: Cycle = cycle();

  it("Cycles repeatedly through a range of numbers", () => {

    range(1, 11).forEach((increment: number): void => {

      const sequence = range(beginning, end, increment);
      const length: number = sequence.length;

      let index: number = firstIndex;

      cycler.setCallback((current: number): void => {

        if (index >= length) {

          index = firstIndex;
        }

        expect(current).to.equal(sequence[index++]);
      })
        .setSpeed(0)
        .setBeginning(beginning)
        .setEnd(end)
        .setIncrement(increment)
        .start();

      setTimeout(() => cycler.stop(), 50);
    });
  });
});
