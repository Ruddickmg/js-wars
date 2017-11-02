import {expect} from "chai";
import range from "../../../../src/tools/array/range";

describe("range", () => {

  it("Generates an array of numbers within the specified range with a specified increment", () => {

    const secondInterval: number = 10;
    const firstInterval: number = 5;
    const secondIncrement: number = 2;
    const thirdIncrement: number = 3;
    const fromZeroToFive: number[] = range(firstInterval);
    const fromZeroToNegativeFive: number[] = range(-firstInterval);
    const fromNegativeFiveToFive: number[] = range(-firstInterval, firstInterval);
    const fromFiveToNegativeFive: number[] = range(firstInterval, -firstInterval);
    const fromTenToNegativeTenByTwo: number[] = range(secondInterval, -secondInterval, secondIncrement);
    const fromNegativeTenToTenByThree: number[] = range(-secondInterval, secondInterval, thirdIncrement);

    let negative: number = -firstInterval;
    let positive: number = firstInterval;
    let zero: number = 0;
    let increment: number = 1;

    fromZeroToFive.forEach((integer: number): void => {

      expect(integer).to.equal(zero++);
    });

    zero = 0;

    fromZeroToNegativeFive.forEach((integer: number): void => {

      expect(integer).to.equal(zero--);
    });
    fromNegativeFiveToFive.forEach((integer: number): void => {

      expect(integer).to.equal(negative++);
    });
    fromFiveToNegativeFive.forEach((integer: number): void => {

      expect(integer).to.equal(positive--);
    });

    positive = secondInterval;
    negative = -secondInterval;
    increment = secondIncrement;

    fromTenToNegativeTenByTwo.forEach((integer: number): void => {

      expect(integer).to.equal(positive);
      positive -= increment;
    });

    increment = thirdIncrement;

    fromNegativeTenToTenByThree.forEach((integer: number): void => {

      expect(integer).to.equal(negative);
      negative += increment;
    });
  });
});
