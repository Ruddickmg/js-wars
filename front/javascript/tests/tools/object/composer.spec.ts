import {expect} from "chai";
import composer, {Composer} from "../../../src/tools/object/composer";

describe("composer", () => {
  const numberOfTests = 50;
  const compose: Composer<any> = composer();
  const objectOne = {
    four: true,
    one: true,
    three: true,
    two: true,
  };
  const objectTwo = {
    eight: true,
    five: true,
    seven: true,
    six: true,
  };
  describe("functions", () => {
    const addOne = (element: number) => element + 1;
    const multiplyByTwo = (element: number) => element * 2;
    const subtractThree = (element: number) => element - 3;
    it("combines multiple functions into one", () => {
      let testing = numberOfTests;
      const all = compose.functions(addOne, multiplyByTwo, subtractThree);
      while (testing--) {
        expect(all(testing)).to.equal(addOne(multiplyByTwo(subtractThree(testing))));
      }
    });
  });
  describe("combine", () => {
    const keys = Object.keys(objectOne)
      .concat(Object.keys(objectTwo));
    it("combines multiple objects into one", () => {
      const obj: any = compose.combine(objectOne, objectTwo);
      keys.forEach((key: string) => expect(obj[key]).to.be.true);
    });
  });
  describe("including", () => {
    const included: string[] = ["five", "six"];
    const notIncluded: string[] = ["seven", "eight"];
    const keys: string[] = Object.keys(objectOne).concat(included);
    it("combines several objects only including specified keys", () => {
      const obj: any = compose.including(included, objectOne, objectTwo);
      keys.forEach((key: string) => expect(obj[key]).to.be.true);
      notIncluded.forEach((key: string) => expect(!obj[key]).to.be.true);
    });
  });
  describe("excluding", () => {
    const notExcluded: string[] = ["seven", "eight"];
    const excluded: string[] = ["five", "six"];
    const keys: any = Object.keys(objectOne).concat(notExcluded);
    it("combines several objects only including specified keys", () => {
      const obj: any = compose.excluding(excluded, objectOne, objectTwo);
      keys.forEach((key: string) => expect(obj[key]).to.be.true);
      excluded.forEach((key: string) => expect(!obj[key]).to.be.true);
    });
  });
});
