"use strict";

function dotProduct(firstArray, secondArray) {

	const length = firstArray.length;

	if (firstArray.constructor !== Array || isNaN(firstArray[0]) || isNaN(firstArray[length - 1])) {

        throw new TypeError("The first argument of dotProduct must be an array of numbers.", "dotProduct.js");
    }

	if (secondArray.constructor !== Array || isNaN(secondArray[0]) || isNaN(secondArray[length - 1])) {

        throw new TypeError("The second argument of dotProduct must be an array of numbers.", "dotProduct.js");
    }

	if (length !== secondArray.length) {

		throw new Error("Both arrays in dotProduct must be the same length.", "dotProduct.js");
    }

	return firstArray.map((value, index) => value * secondArray[index]);
}

module.exports = dotProduct;