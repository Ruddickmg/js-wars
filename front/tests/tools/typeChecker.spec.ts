import {expect} from "chai";
import typeChecker from "../../src/tools/typeChecker";

describe("typeChecker", () => {

    const stringType = "this is a string";
    const objectType = {a: 1, b: 2, c: 3};
    const arrayType = [1, 2, 3];
    const dateType = new Date();
    const numberType = 1;
    const booleanType = true;
    const nullType: any = null;
    const undefinedType: any = undefined;
    const functionType = () => true;

    describe("isArray", () => {

        it("returns true if an object is an array", () => {

            expect(typeChecker.isArray(arrayType)).to.equal(true);

            [dateType, nullType, undefinedType, objectType, numberType, stringType, booleanType, functionType]
                .forEach((element: any): void => {

                    expect(typeChecker.isArray(element)).to.equal(false);
                });
        });
    });

    describe("isFunction", () => {

        it("returns true if an object is a function", () => {

            expect(typeChecker.isFunction(functionType)).to.equal(true);

            [dateType, nullType, undefinedType, objectType, numberType, stringType, booleanType, arrayType]
                .forEach((element: any): void => {

                    expect(typeChecker.isFunction(element)).to.equal(false);
                });
        });
    });

    describe("isBoolean", () => {

        it("returns true if an object is a boolean", () => {

            expect(typeChecker.isBoolean(booleanType)).to.equal(true);

            [dateType, nullType, undefinedType, objectType, numberType, stringType, arrayType, functionType]
                .forEach((element: any): void => {

                    expect(typeChecker.isBoolean(element)).to.equal(false);
                });
        });
    });

    describe("isString", () => {

        it("returns true if an object is a string", () => {

            expect(typeChecker.isString(stringType)).to.equal(true);

            [dateType, nullType, undefinedType, objectType, numberType, booleanType, arrayType, functionType]
                .forEach((element: any): void => {

                    expect(typeChecker.isString(element)).to.equal(false);
                });
        });
    });

    describe("isObject", () => {

        it("returns true if an object is an object", () => {

            expect(typeChecker.isObject(objectType)).to.equal(true);

            [dateType, nullType, undefinedType, stringType, numberType, booleanType, arrayType, functionType]
                .forEach((element: any): void => {

                    expect(typeChecker.isObject(element)).to.equal(false);
                });
        });
    });
});
