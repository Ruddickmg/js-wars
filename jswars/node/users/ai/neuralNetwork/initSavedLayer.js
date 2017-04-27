/* -------------------------------------------------------------------------------------------- *\

    @ initFromSavedLayer: initializes and returns an array of previously saved perceptrons
	 
	 perceptrons = [{weights:x, bias:y, learningRate:z}], array of uninitialized perceptron data

\* --------------------------------------------------------------------------------------------- */

var perceptron = require("./perceptron.js");

module.exports = function (perceptrons) {

	var p, nodes = [];
	var l = perceptrons.length;

	while (l--) {

		p = perceptrons[l];

		nodes[l] = perceptron(p.size, p.bias, p.learningRate, p.weights);
	}

	return nodes;
};