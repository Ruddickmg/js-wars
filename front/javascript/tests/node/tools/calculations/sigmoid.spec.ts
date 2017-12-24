import {expect} from "chai";
import sigmoidCalculator, {Sigmoid} from "../../../../src/tools/calculations/sigmoid";

describe("sigmoid", () => {
  const numberToEvaluate: number = 6.24;
  const sigmoid: Sigmoid = sigmoidCalculator();
  it("Calculates general log sigmoid", () => {
    const result: number = 0.9980539390149143;
    expect(sigmoid.log(numberToEvaluate)).to.equal(result);
  });
  it("Calculates general tanh sigmoid", () => {
    const expected: number = 0.9999923961557893;
    const neg: number = Math.exp(-numberToEvaluate);
    const pos: number = Math.exp(numberToEvaluate);
    const result: number = sigmoid.tanh(numberToEvaluate);
    expect(result).to.equal(expected);
    expect(result).to.equal(((pos - neg) / (pos + neg)));
  });
});
