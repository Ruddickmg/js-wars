import {expect} from "chai";
import range from "../../../../src/tools/array/range";
import summation, {Summer} from "../../../../src/tools/calculations/sum";

describe("sum", () => {
  const summer: Summer = summation();
  const array: number[] = range(1, 5, 3);
  describe("add", () => {
    it("Sums an array of numbers via addition", () => {
      const sum: number = summer.add(array);
      let expected: number = 0;
      array.forEach((integer: number): void => {
        expected += integer;
      });
      expect(sum).to.equal(expected);
    });
  });
  describe("square", () => {
    it("Sums each number in an array squared", () => {
      const sum: number = summer.square(array);
      let expected: number = 0;
      array.forEach((integer: number): void => {
        expected += Math.pow(integer, 2);
      });
      expect(sum).to.equal(expected);
    });
  });
  describe("exp", () => {
    it("Sums the euler's number of each number in an array.", () => {
      const sum: number = summer.exp(array);
      let expected: number = 0;
      array.forEach((integer: number): void => {
        expected += Math.exp(integer);
      });
      expect(sum).to.equal(expected);
    });
  });
});
