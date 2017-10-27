import {expect} from "chai";
import isNonNegative from "../../../../src/tools/validation/nonNegativeIndex";

describe("nonNegativeIndex", () => {

  it("tells whether a number is negative or not", () => {

    expect(isNonNegative(-1)).to.equal(false);
    expect(isNonNegative(1)).to.equal(true);
  });
});
