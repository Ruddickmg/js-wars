import {expect} from "chai";
import reduce from "../../../src/tools/array/reduce";

describe("reduce", () => {
  it("Combines array values into a container based on the return of a callback", () => {
    const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
    let sum: number = 0;
    numbers.forEach((integer: number) => {
      sum += integer;
    });
    expect(reduce((currentSum: number, integer: number): number => currentSum + integer, numbers, 0, 0))
      .to.equal(sum);
  });
});
