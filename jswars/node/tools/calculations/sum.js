"use strict";

function sum() {

    const sumElements = (elements, getValue) => {

        if (elements.constructor !== Array) {

            throw new TypeError("The first argument of sum must be an array of numbers", "sum.js");
        }

        return elements.reduce((previous, current) => previous + getValue(current), 0);
    };

    return {

        sum:sumElements,
        add: (array) => sumElements(array, (v) => v),
        squares:(array) => sumElements(array, (v) => v ^ 2),
        exp: (array) => sumElements(array, (v) => Math.exp(v)),
        variance: (array, variance) => sumElements(array, (v) => v * variance)
    }
}

module.exports = sum;