/**
 * Created by moonmaster on 5/18/17.
 */

import {expect} from "chai";
import {default as dictionary, Dictionary} from "../../src/tools/dictionary";

describe("dictionary", () => {

    const dict: Dictionary = dictionary();
    const value: string = "rosebud";
    const replacementValue: string = "the replacement";
    const nameForDefinitions = "definitions";
    const definitions: any = {

        four: 4,
        one: 1,
        three: 3,
        two: 2,
    };

    describe("lookUp", () => {

        const terms: string[] = ["how", "now", "brown", "cow"];

        it("Returns a boolean indicating whether a definition exists or not.", () => {

            dict.add(...terms.concat([value]));

            expect(dict.lookup("this", "doesn't", "exist")).to.equal(false);
            expect(dict.lookup(...terms)).to.equal(true);
            expect(dict.lookup(...terms.splice(0, 2))).to.equal(true);
        });
    });

    describe("add", () => {

        const terms: string[] = ["hi", "there"];

        it("Adds a definition to the dictionary.", () => {

            let returned: Dictionary;

            dict.add(...terms.concat([value]));

            expect(dict.get(...terms)).to.equal(value);
            expect(() => dict.add(...terms.concat([replacementValue]))).to.throw(RangeError);

            returned = dict.get(terms.splice(0, 1));

            expect(returned).is.a("object");
            expect(returned.get(terms)).to.equal(value);
        });
    });

    describe("redefine", () => {

        const terms: string[] = ["how", "cool", "is", "being", "cool?"];

        it("Redefines a definition in the dictionary", () => {

            dict.add(...terms.concat([value]))
                .redefine(...terms.concat([replacementValue]));

            expect(dict.get(...terms)).to.equal(replacementValue);
        });
    });

    describe("remove", () => {

        const terms: string[] = ["zimbabwe"];

        it ("Removes a definition from the dictionary.", () => {

            dict.add(...terms.concat([value]));
            expect(dict.lookup(...terms)).to.equal(true);
            dict.remove(...terms);
            expect(dict.lookup(...terms)).to.equal(false);
        });
    });

    describe("get", () => {

        const terms: string[] = ["check", "this", "new", "test"];

        it("Adds a definition to the dictionary.", () => {

            dict.add(...terms.concat([value]));

            expect(dict.lookup(...terms)).to.equal(true);
            expect(dict.get(...terms)).to.equal(value);
        });
    });

    describe("map", () => {

        dict.add(nameForDefinitions, definitions);

        it("Applies a function to each element of the dictionary.", () => {

            const addedNumber = 1;
            const result: any = dict.get(nameForDefinitions)
                .map((currentValue: number) => currentValue + addedNumber)
                .toObject();

            const indices: string[] = Object.keys(result);

            indices.forEach((key: string) => expect(result[key]).to.equal(definitions[key] + addedNumber));
        });
    });

    describe("reduce", () => {

        const expectedResult = 10;

        it("Combines each parameter in dictionary into one output value.", () => {

            dict.redefine(nameForDefinitions, definitions);

            expect(dict.get(nameForDefinitions).reduce((a: number, v: number): number => a + v, 0))
                .to.equal(expectedResult);
        });
    });

    describe("toObject", () => {

        dict.redefine(nameForDefinitions, definitions);

        it("returns an object of the retrieved element rather then a dictionary.", () => {

            expect(dict.get(nameForDefinitions).toObject()).to.equal(definitions);
        });
    });
});
