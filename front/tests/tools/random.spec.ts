import {expect} from "chai";
import random from "../../src/tools/random";

describe("random", () => {

    const numberOfTests = 10;
    const low = 5;
    const high = 10;
    const isRandomNumberInRange = (randomNumber: number): void => {

        expect(randomNumber).a("number");
        expect(randomNumber).above(low);
        expect(randomNumber).below(high);
    };

    describe("boolean", () => {

        it ("returns a random boolean value", () => {

            let testing = numberOfTests;

            while (testing--) {

                expect(random.boolean()).a("boolean");
            }
        });
    });

    describe("inRange", () => {

       let testing = numberOfTests;
       let randomNumber;

       while (testing--) {

            randomNumber = random.inRange(low, high);

            isRandomNumberInRange(randomNumber);
       }
    });

    describe("array", () => {

        const randomNumberArray = random.array(numberOfTests, low, high);

        it ("creates an array of random numbers in a range", () => {

            randomNumberArray.forEach((element) => isRandomNumberInRange(element));
        });
    });
});
