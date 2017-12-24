import {expect} from "chai";
import getRange from "../../../../src/tools/calculations/getAllowedRange";

describe("getAllowedRange", () => {
  const array: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  it("Gets the desired range allowed if over length.", () => {
    const expected: number[] = [5, 6, 7, 8, 9];
    const values: number[] = getRange(array.length, 7, 11)
      .map((index: number): number => array[index]);
    expect(values).to.deep.equal(expected);
  });
  it("Gets the desired range allowed if under length.", () => {
    const expected: number[] = [1, 2, 3, 4, 5];
    const values: number[] = getRange(array.length, -2, 2)
      .map((index: number): number => array[index]);
    expect(values).to.deep.equal(expected);
  });
  it("Gets the desired range if in range.", () => {
    const expected: number[] = [3, 4, 5, 6, 7];
    const values: number[] = getRange(array.length, 2, 6)
      .map((index: number): number => array[index]);
    expect(values).to.deep.equal(expected);
  });
});
