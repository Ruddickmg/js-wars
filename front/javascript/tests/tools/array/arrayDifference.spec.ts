import {expect} from "chai";
import difference from "../../../src/tools/array/difference";

describe("difference", () => {
  it("Removes all footerElements in one array from another.", () => {
    const arrayOne: any[] = [1, 2, 3, 4, 5, 6];
    const arrayTwo: any[] = [1, 2, 3];
    const expectedDifference: any[] = [4, 5, 6];
    difference(arrayOne, arrayTwo).forEach((value: number, index: number): void => {
      expect(value).to.equal(expectedDifference[index]);
    });
  });
});
