import {expect} from "chai";
import typeChecker, {TypeChecker} from "../../../../src/tools/validation/typeChecker";

describe("typeChecker", () => {
  const sinon = require("sinon");
  const stringType = "this is a string";
  const objectType = {a: 1, b: 2, c: 3};
  const arrayType = [1, 2, 3];
  const dateType = new Date();
  const numberType = 1;
  const booleanType = true;
  const nullType: any = null;
  const undefinedType: any = undefined;
  const functionType = () => true;
  const errorType = Error("testing!");
  const check: TypeChecker = typeChecker();
  describe("isArray", () => {
    it("returns true if an object is an array", () => {
      expect(check.isArray(arrayType)).to.equal(true);
      [
        errorType,
        dateType,
        nullType,
        undefinedType,
        objectType,
        numberType,
        stringType,
        booleanType,
        functionType,
      ].forEach((element: any): void => {
        expect(check.isArray(element)).to.equal(false);
      });
    });
  });
  describe("isError", () => {
    it("returns true if an object is an error", () => {
      expect(check.isError(errorType)).to.equal(true);
      [
        arrayType,
        dateType,
        nullType,
        undefinedType,
        objectType,
        numberType,
        stringType,
        booleanType,
        functionType,
      ].forEach((element: any): void => {
        expect(check.isError(element)).to.equal(false);
      });
    });
  });
  describe("isFunction", () => {
    it("returns true if an object is a function", () => {
      expect(check.isFunction(functionType)).to.equal(true);
      [errorType, dateType, nullType, undefinedType, objectType, numberType, stringType, booleanType, arrayType]
        .forEach((element: any): void => {
          expect(check.isFunction(element)).to.equal(false);
        });
    });
  });
  describe("isBoolean", () => {
    it("returns true if an object is a boolean", () => {
      expect(check.isBoolean(booleanType)).to.equal(true);
      [errorType, dateType, nullType, undefinedType, objectType, numberType, stringType, arrayType, functionType]
        .forEach((element: any): void => {
          expect(check.isBoolean(element)).to.equal(false);
        });
    });
  });
  describe("isString", () => {
    it("returns true if an object is a string", () => {
      expect(check.isString(stringType)).to.equal(true);
      [errorType, dateType, nullType, undefinedType, objectType, numberType, booleanType, arrayType, functionType]
        .forEach((element: any): void => {
          expect(check.isString(element)).to.equal(false);
        });
    });
  });
  describe("isObject", () => {
    it("returns true if an object is an object", () => {
      expect(check.isObject(objectType)).to.equal(true);
      [errorType, dateType, nullType, undefinedType, stringType, numberType, booleanType, arrayType, functionType]
        .forEach((element: any): void => {
          expect(check.isObject(element)).to.equal(false);
        });
    });
  });
  describe("register", () => {
    const callback = sinon.spy();
    it(`Registers a new type with a method to check it with.`, () => {
      check.register("test", callback);
      check.isTest();
      expect(callback.calledOnce).to.equal(true);
    });
  });
  describe("registerChecksOnProperty", () => {
    const testType = "ValidType";
    it("Registers type checks by a specified object property", () => {
      check.register(testType, (property): boolean => property === testType);
      expect(check["is" + testType](testType)).to.equal(true);
    });
  });
});
