import {expect} from "chai";
import getErrorHandler, {ErrorHandler} from "../../../../src/tools/validation/errorHandler";

describe("errorHandler", () => {

  const errorHandler: ErrorHandler = getErrorHandler();
  const errorObject: any = {
    className: "test",
    input: "testing",
    message: "something",
    method: "test method",
  };

  it("Manufactures and handles invalid input errors.", () => {

    const {input, method, className}: any = errorObject;

    expect(errorHandler.invalidInput.bind(errorHandler, errorObject))
      .to.throw(`Invalid input: ${input} found on call to ${method} in ${className}.`);
  });

  it("Manufactures and handles not found errors.", () => {

    const {input, method, className, message}: any = errorObject;

    expect(errorHandler.notFound.bind(errorHandler, errorObject))
      .to.throw(`Unable to ${message} from ${className}. ${input} was not found in ${method}.`);
  });

  it("Manufactures and handles not found errors.", () => {

    const {method, className, message}: any = errorObject;

    expect(errorHandler.customError.bind(errorHandler, errorObject))
      .to.throw(`${message} from method ${method}, in ${className}`);
  });

  it("Manufactures and handles generic errors.", () => {

    const message: string = "This is not a test.";

    expect(errorHandler.error.bind(errorHandler, message)).to.throw(message);
  });
});
