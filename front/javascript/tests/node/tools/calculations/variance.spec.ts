import {expect} from "chai";
import variance from "../../../../src/tools/calculations/variance";

describe("variance", () => {

  it("Calculates the standard deviation of a numerical array", () => {

    const sampleDeviation: number = 176.47619047619048;
    const deviation: number = 151.26530612244898;
    const array: number[] = [10, 2, 38, 23, 38, 23, 21];

    expect(variance(array, true)).to.equal(sampleDeviation);
    expect(variance(array)).to.equal(deviation);
  });
});
