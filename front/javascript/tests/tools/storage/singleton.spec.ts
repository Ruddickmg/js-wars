import {expect} from "chai";
import single from "../../../src/tools/storage/singleton";

describe("singleton", () => {
  const createObject = () => ({});
  it("creates a single instance of an object", () => {
    const singleton = single(createObject);
    const objectOne = singleton();
    const objectTwo = singleton();
    expect(objectOne).to.equal(objectTwo);
  });
});
