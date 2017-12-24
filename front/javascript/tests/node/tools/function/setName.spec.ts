import {expect} from "chai";
import setName from "../../../../src/tools/function/setName";

describe("setName", () => {
  it("Sets the name for an object", () => {
    const object: any = function() {
      return "new object";
    };
    const newName: string = "dave";
    expect(object.name).to.equal("object");
    setName(object, newName);
    expect(object.name).to.equal(newName);
  });
});
