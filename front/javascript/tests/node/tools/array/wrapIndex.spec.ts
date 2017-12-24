import {expect} from "chai";
import wrapIndex from "../../../../src/tools/array/wrapIndex";

describe("wrapIndex", () => {
  it("keeps index within range by wrapping indices out of range to the beginning or end of the array", () => {
    const limit: number = 100;
    const doubleLimit: number = limit * 2;
    expect(wrapIndex(limit, limit)).to.equal(0);
    expect(wrapIndex(limit + 1, limit)).to.equal(1);
    expect(wrapIndex(-1, limit)).to.equal(limit - 1);
    expect(wrapIndex(limit + 2, limit)).to.equal(2);
    expect(wrapIndex(-2, limit)).to.equal(limit - 2);
    expect(wrapIndex(limit + 3, limit)).to.equal(3);
    expect(wrapIndex(-3, limit)).to.equal(limit - 3);
    expect(wrapIndex(doubleLimit + 1, limit)).to.equal(1);
    expect(wrapIndex(-(doubleLimit + 1), limit)).to.equal(limit - 1);
  });
});
