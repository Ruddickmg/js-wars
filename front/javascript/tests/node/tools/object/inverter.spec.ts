import {expect} from "chai";
import invert from "../../../../src/tools/object/inverter";

describe("inverter", () => {
  it("Replaces all object keys with their values and values with keys", () => {
    const keys = ["a", "b", "c"];
    const values = [1, 2, 3];
    const object = keys.reduce((obj: any, key: any, index: number): any => {
      obj[key] = values[index];
      return obj;
    }, {});
    const inverted: any = invert(object);
    values.forEach((value: any, index: number): void => {
      expect(inverted[`${value}`]).to.equal(keys[index]);
    });
  });
});
