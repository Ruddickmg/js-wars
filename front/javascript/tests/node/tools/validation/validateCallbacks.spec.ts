import {expect} from "chai";
import errorHandler from "../../../../src/tools/validation/errorHandler";
import validateCallbacks from "../../../../src/tools/validation/validateCallbacks";

describe("validateCallbacks", () => {

  const callBackOne = () => "one";
  const callBackTwo = () => "two";
  const callbacks: any[] = [callBackOne, callBackTwo];
  const input: number = 1;
  const method: string = "testing";
  const className: string = "test";
  const notCallbacks: any[] = [1];
  const validCallbacks: any[] = validateCallbacks(callbacks, method, className);

  errorHandler();

  expect(validateCallbacks.bind(validCallbacks, notCallbacks, className, method))
    .to.throw(`Invalid input: ${input} found on call to ${method} in ${className}.`);

  validCallbacks.forEach((callback: any, index: any): void => {

      expect(callback).to.equal(callbacks[index]);
  });
});
