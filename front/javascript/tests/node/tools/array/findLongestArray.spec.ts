import {expect} from "chai";
import longestArray from "../../../../src/tools/array/findLongestArray";

describe("findLongestArray", () => {

  it("Returns the longest array of any amount of arrays.", () => {

    const arrayOne: any[] = [1, 2, 3];
    const arrayTwo: any[] = [1, 2, 3, 4];
    const arrayThree: any[] = ["ff", "rrrr", "3", 4];
    const longest: any[] = [1, 2, 3, 4, 5];

    expect(longestArray(arrayOne, arrayTwo, longest, arrayThree)).to.equal(longest);
  });
})