import {expect} from "chai";
import findTruthInArray from "../../../../src/tools/array/checkForTruthInArray";

describe("findTruthInArray", () => {
  it("checks if there is a positive value when no callback is provided", () => {
    const falseArray = [0, false, null, undefined];
    const trueArray = [0, false, null, true, undefined];
    expect(findTruthInArray(falseArray)).to.equal(false);
    expect(findTruthInArray(trueArray)).to.equal(true);
  });
  it("checks if there is positive boolean returned from a provided callback for any value of an array", () => {
    const limit: number = 7;
    const falseArray = [1, 2, 3, 4, 5, 6, 7];
    const trueArray = [2, 3, 4, 5, 6, 6, 8];
    const callback = (integer: number): boolean => integer > limit;
    expect(findTruthInArray(falseArray, callback)).to.equal(false);
    expect(findTruthInArray(trueArray, callback)).to.equal(true);
  });
});
