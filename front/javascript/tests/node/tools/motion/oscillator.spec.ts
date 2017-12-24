import {expect} from "chai";
import range from "../../../../src/tools/array/range";
import oscillation, {Oscillator} from "../../../../src/tools/motion/oscillator";

describe("oscillator", () => {
  const beginning: number = -2;
  const end: number = 100;
  const firstIndex: number = 0;
  it("Oscillates back and forth repeatedly between a range of numbers", () => {
    range(1, 11).forEach((increment: number): void => {
      const oscillator: Oscillator = oscillation();
      const beginningSequence: number[] = range(beginning, end, increment);
      const endingSequence: number[] = beginningSequence.slice().reverse();
      let sequence: number[];
      let index: number = firstIndex;
      let length: number;
      endingSequence.pop();
      endingSequence.shift();
      sequence = beginningSequence.concat(endingSequence);
      length = sequence.length;
      oscillator.setCallback((current: number): void => {
          if (index >= length) {
            index = firstIndex;
          }
          expect(current).to.equal(sequence[index++]);
        })
        .setSpeed(0)
        .setPosition(beginning)
        .setMinimum(beginning)
        .setMaximum(end)
        .setIncrement(increment)
        .start();
      setTimeout(() => oscillator.stop(), 500);
    });
  });
});
