"use strict";

module.exports = {

	array(length, min=0, max=1) {

		if (isNaN(length)) {

            throw new Error(`The first argument of "array" must be an integer.`, "random.js");
        }

		const array = [];

		while (length--) {

            array.push(this.range(min, max));
        }

		return array;
	},

	range(min, max) {

		return Math.random() * (max - min) + min;
	}
};