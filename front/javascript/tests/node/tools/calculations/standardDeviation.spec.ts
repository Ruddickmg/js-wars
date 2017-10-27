import {expect} from "chai";
import standardDeviation from "../../../../src/tools/calculations/standardDeviation";

describe("standardDeviation", () => {

  it("Calculates the standard deviation of a numerical array", () => {

    const sampleDeviation: number = 13.284434142114993;
    const deviation: number = 12.29899614287479;
    const array: number[] = [10, 2, 38, 23, 38, 23, 21];

    expect(standardDeviation(array, true)).to.equal(sampleDeviation);
    expect(standardDeviation(array)).to.equal(deviation);
  });
});
