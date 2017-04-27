"use strict";

function heapTester() {

    const
        defaultNumberOfTests = 1000,
        getRandom = (minimum, maximum) => {

            const
                roundMinimum = Math.ceil(minimum),
                roundMaximum = Math.floor(maximum),
                randomNumber = Math.random();

            return Math.floor(randomNumber * (roundMaximum - roundMinimum)) + roundMinimum;
        },
        randomList = (length) => {

            const listOfRandomNumbers = [];
            let amount = length;

            while (amount--) {

                listOfRandomNumbers.push(getRandom(1, length));
            }

            return listOfRandomNumbers;
        },
        printAndReturnResult = (name, bool) => {

            console.log(`${name}${(bool ? ": Success" : ": Failed")}`);

            return bool;
        },
        test = (compare, heap) => {

            let
                previous = heap.pop(),
                current = heap.pop();

                while (heap.size() && compare(current, previous)) {

                    previous = current;
                    current = heap.pop();
                }

            return heap
        },
        runTest = (name, amount, heap, compare) => {

            randomList(amount).forEach((number) => heap.push(number));

            return printAndReturnResult(name, !test(compare, heap).size());
        };

    return {

        test(heap, numberOfTests = defaultNumberOfTests) {

            const testResults = [];
            let success;

            console.log("---=== Testing Heap ===---");

            heap.clear()
                .setToMax();

            testResults.push(runTest("Max", numberOfTests, heap, (current, previous) => (current <= previous)));

            heap.clear()
                .setToMin();

            testResults.push(runTest("Min", numberOfTests, heap, (current, previous) => (current >= previous)));

            success = testResults.reduce((previous, current) => previous && current, true);

            console.log(`${(success ? "All" : "Not all")} tests were successful.`);
            console.log("------====================------");
            console.log("");

            heap.clear();

            return success;
        }
    };
}

module.exports = heapTester;