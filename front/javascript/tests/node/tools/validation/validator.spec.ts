import {expect} from "chai";
import capitalizeFirstLetter from "../../../../src/tools/stringManipulation/capitalizeFirstLetter";
import validator, {Validator} from "../../../../src/tools/validation/validator";

describe("validator", () => {

  const testName: string = "validatorTest";
  const validation: Validator = validator(testName);
  const types: any[] = [
    {
      invalid: [],
      type: "string",
      valid: "yo",
    },
    {
      invalid: [],
      type: "object",
      valid: {},
    },
    {
      invalid: {},
      type: "function",
      valid() {
        // yay,
      },
    },
    {
      invalid: null,
      type: "boolean",
      valid: true,
    },
    {
      invalid: "string",
      type: "array",
      valid: [],
    },
    {
      invalid: "1",
      type: "number",
      valid: 1,
    },
    {
      invalid: {},
      type: "error",
      valid: Error("this is an error!"),
    },
    {
      invalid: void 0,
      type: "defined",
      valid: null,
    },
    {
      invalid: void 0,
      type: "null",
      valid: null,
    },
  ];

  it("Throws an error if it encounters an invalid type.", () => {

    types.forEach(({type, valid, invalid}: any): void => {

      const validationName: string = `validate${capitalizeFirstLetter(type)}`;
      const validate: any = validation[validationName];

      expect(validate(valid, validationName)).to.equal(true);
      expect(validate.bind(validate, invalid, validationName))
        .to.throw(`Invalid input: ${invalid} found on call to ${validationName} in ${testName}.`);
    });
  });
});
