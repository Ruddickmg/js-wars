import {expect} from "chai";
import curry from "../../src/tools/curry";

describe("curry", () => {

    const testFunction = (a: number, b: number, c: number): number => a + b + c;
    const first = 1;
    const second = 2;
    const third = 3;

    it("creates a curried function from a non curried function", () => {

        const curriedFunction = curry(testFunction);
        const suppliedFirstArg = curriedFunction(first);
        const suppliedFirstAndSecondArg = suppliedFirstArg(second);
        const testResult = testFunction(first, second, third);

        [
            curriedFunction(first, second, third),
            suppliedFirstArg(second, third),
            suppliedFirstAndSecondArg(third),

        ].reduce((_: any, result: number) => expect(result).to.equal(testResult));
    });
});
