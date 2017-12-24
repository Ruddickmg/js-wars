import {expect} from "chai";
import zipWith from "../../../../src/tools/array/zipWith";
import random from "../../../../src/tools/calculations/random";

describe("zipWith", () => {
  const max: number = 100;
  const middle: number = 50;
  const min: number = 10;
  const shorterLength: number = Math.floor(random.inRange(min, middle));
  const longerLength: number = Math.ceil(random.inRange(middle, max));
  const combiningFunction: any = (elementOne: number, elementTwo: number) => elementOne + elementTwo;
  const randomArrayOne: number[] = random.array(shorterLength, min, max);
  const randomArrayTwo: number[] = random.array(longerLength, min, max);
  it("combines two arrays with a function", () => {
    const zipped = zipWith(randomArrayOne, randomArrayTwo, combiningFunction);
    zipped.forEach((result: number, index: number) => {
      expect(combiningFunction(randomArrayOne[index], randomArrayTwo[index])).to.equal(result);
    });
  });
});
