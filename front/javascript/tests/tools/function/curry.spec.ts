import {expect} from "chai";
import curry from "../../../src/tools/function/curry";

describe("curry", () => {
  it("creates a curried function from a non curried function", () => {
    const scopedTest = function() {
      const aPlusBPlusC = (a: number, b: number, c: number): number => a + b + c;
      const testFunction = (a: number, b: number, c: number): number => aPlusBPlusC(a, b, c);
      const newScopeStuff = {
        first: 1,
        second: 2,
        third: 3,
      };
      const {first, second, third} = newScopeStuff;
      const testResult = testFunction(first, second, third);
      const curriedFunction = curry(testFunction);
      const suppliedFirstArg = curriedFunction(first);
      const suppliedFirstAndSecondArg = suppliedFirstArg(second);
      return Object.assign(newScopeStuff, {
        curriedFunction,
        suppliedFirstAndSecondArg,
        suppliedFirstArg,
        testResult,
      });
    };
    const {
      curriedFunction: curried,
      suppliedFirstAndSecondArg: firstAndSecondArg,
      suppliedFirstArg: firstArg,
      testResult: expectedResult,
      first: firstElement,
      second: secondElement,
      third: thirdElement,
    } = scopedTest();
    [
      curried(firstElement, secondElement, thirdElement),
      firstArg(secondElement, thirdElement),
      firstAndSecondArg(thirdElement),
    ].forEach((result: number) => expect(result).to.equal(expectedResult));
  });
});
