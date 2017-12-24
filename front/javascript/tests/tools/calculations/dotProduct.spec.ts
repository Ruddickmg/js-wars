import {expect} from "chai";
import dotProduct from "../../../src/tools/calculations/dotProduct";

describe("dotProduct", () => {
  it("Returns an array containing the product of values found at each index of two arrays", () => {
    const array: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(dotProduct(array, array)).to.equal(array.reduce((product: number, value: number): number => {
      return product + (value * value);
    }));
  });
});
