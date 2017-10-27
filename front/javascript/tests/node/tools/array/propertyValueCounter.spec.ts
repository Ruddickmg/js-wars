import {expect} from "chai";
import count from "../../../../src/tools/array/propertyValueCounter";

describe("propertyValueCounter", () => {

  it("counts the number of identical values retrieved from a callback on an array of objects", () => {

    const objects = [
      {a: "two", c: "three"},
      {a: "two", c: "three"},
      {b: "one", a: "yo"},
      {a: "yo", c: "three"},
    ];

    expect(count(objects, (object: any) => object.b).one).to.equal(1);
    expect(count(objects, (object: any) => object.a).two).to.equal(2);
    expect(count(objects, (object: any) => object.c).three).to.equal(3);
  });
});
