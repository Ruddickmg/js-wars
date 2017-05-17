import {expect} from "chai";
import typeChecker from "../../src/tools/typeChecker";

describe("typeChecker", () => {

    const stringType: string = "this is a string";
    const objectType: object = {};
    const arrayType: any[] = [1, 2, 3, 4];
    const numberType: number = 1;
    const booleanType: boolean = true;
    const functionType: () => any = () => true;

    describe("isArray", () => {

        it("returns true if an object is an array", () => {

            expect(typeChecker.isArray(arrayType)).to.be.true;

            [objectType, numberType, stringType, booleanType, functionType].forEach((element: any): void => {

                expect(typeChecker.isArray(element)).to.be.false;
            });
        });
    });

    describe("isFunction", () => {

        it("returns true if an object is a function", () => {

            expect(typeChecker.isFunction(functionType)).to.be.true;

            [objectType, numberType, stringType, booleanType, arrayType].forEach((element: any): void => {

                expect(typeChecker.isFunction(element)).to.be.false;
            });
        });
    });

    describe("isBoolean", () => {

        it("returns true if an object is a boolean", () => {

            expect(typeChecker.isBoolean(booleanType)).to.be.true;

            [objectType, numberType, stringType, arrayType, functionType].forEach((element: any): void => {

                expect(typeChecker.isBoolean(element)).to.be.false;
            });
        });
    });

    describe("isString", () => {

        it("returns true if an object is a string", () => {

            expect(typeChecker.isString(stringType)).to.be.true;

            [objectType, numberType, booleanType, arrayType, functionType].forEach((element: any): void => {

                expect(typeChecker.isString(element)).to.be.false;
            });
        });
    });
});
