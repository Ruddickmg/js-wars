import {expect} from "chai";
import typeChecker from "../../../src/tools/validation/typeChecker";

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
  describe("isArray", () => {
    it("returns true if an object is an array", () => {
      expect(typeChecker.isArray(arrayType)).to.equal(true);
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
        expect(typeChecker.isArray(element)).to.equal(false);
      });
    });
  });
  describe("isError", () => {
    it("returns true if an object is an error", () => {
      expect(typeChecker.isError(errorType)).to.equal(true);
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
        expect(typeChecker.isError(element)).to.equal(false);
      });
    });
  });
  describe("isFunction", () => {
    it("returns true if an object is a function", () => {
      expect(typeChecker.isFunction(functionType)).to.equal(true);
      [errorType, dateType, nullType, undefinedType, objectType, numberType, stringType, booleanType, arrayType]
        .forEach((element: any): void => {
          expect(typeChecker.isFunction(element)).to.equal(false);
        });
    });
  });
  describe("isBoolean", () => {
    it("returns true if an object is a boolean", () => {
      expect(typeChecker.isBoolean(booleanType)).to.equal(true);
      [errorType, dateType, nullType, undefinedType, objectType, numberType, stringType, arrayType, functionType]
        .forEach((element: any): void => {
          expect(typeChecker.isBoolean(element)).to.equal(false);
        });
    });
  });
  describe("isString", () => {
    it("returns true if an object is a string", () => {
      expect(typeChecker.isString(stringType)).to.equal(true);
      [errorType, dateType, nullType, undefinedType, objectType, numberType, booleanType, arrayType, functionType]
        .forEach((element: any): void => {
          expect(typeChecker.isString(element)).to.equal(false);
        });
    });
  });
  describe("isObject", () => {
    it("returns true if an object is an object", () => {
      expect(typeChecker.isObject(objectType)).to.equal(true);
      [errorType, dateType, nullType, undefinedType, stringType, numberType, booleanType, arrayType, functionType]
        .forEach((element: any): void => {
          expect(typeChecker.isObject(element)).to.equal(false);
        });
    });
  });
  describe("register", () => {
    const callback = sinon.spy();
    it(`Registers a new type with a method to check it with.`, () => {
      typeChecker.register("test", callback);
      typeChecker.isTest();
      expect(callback.calledOnce).to.equal(true);
    });
  });
  describe("registerChecksOnProperty", () => {
    const testType = "ValidType";
    it("Registers type checks by a specified object property", () => {
      typeChecker.register(testType, (property): boolean => property === testType);
      expect(typeChecker["is" + testType](testType)).to.equal(true);
    });
  });
});
