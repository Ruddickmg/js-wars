module.exports = (element, numberOfRepetitions) => {

	if (isNaN(numberOfRepetitions)) {

        throw new Error("Second argument of repeat must be an integer.", "repeat.js");
    }

    const array = [];

	while (numberOfRepetitions--) {

        array.push(element);
    }

	return array;
};