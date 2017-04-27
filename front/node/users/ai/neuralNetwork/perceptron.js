/* ----------------------------------------------------------------------------------- *\

	@ Perceptron is a classification and learning algorithm.
	
		inputSize = number, defines the expected amount of inputs for the perceptron
		thresh = number, defines bias
		rate = number, defines learning rate
		weight = [number], optional - an array of predefined weights

\* ----------------------------------------------------------------------------------- */

var random = require("../../tools/calulations/random.js");
var sigmoid = require("../../tools/calculations/sigmoid.js");
var dotProduct = require("../../tools/calculations/dotProduct.js");
var sum = require("../../tools/calculations/sum.js");

module.exports = function (inputSize, thresh, rate, weight) {

	if ((!weight || weight.constructor !== Array) && (!size || isNaN(size))) {

		throw new Error("The first argument of perceptron: \"size\", is required and must be a number.", "perceptron.js");
	}

	if (thresh && isNaN(thresh)) {

		throw new Error("The second argument of perceptron: \"thresh\", must be a number.", "perceptron.js");
	}

	if (rate && isNaN(rate)) {

		throw new Error("The second argument of perceptron: \"rate\", must be a number.", "perceptron.js");
	}

	return function () {

		/*
		*	@ size: number, amount of inputs expected for the perceptron to act on
		*	@ weights: [number], array of numbers representing the probability of selecting a sepecific output
		*	@ bias: number, used to offset zero while training the perceptron
		*	@ learningRate: number, used as a step size while training the perceptron
		*/

		var input, product, output, size = inputSize;
		var weights = weight && weight.constructor === Array ? weight : random.array(size, -0.5, 0.6);
		var weightCorrections;
		var biasCorrection, bias = thresh || 1;
		var learningRate = learningRate || 0.3;

		return {

			/**
			*  @classify: returns the result of calling activate
			*
			*   i = [number], inputs
			*/

			classify: function (i) { 

				return this.activate(weights, (input = i), bias) > 0 ? 1 : -1; 
			},

			/**
			*  @propigate: trains percoptron on back propigation data, returns the perceptron
			*
			*   w = [number], weight updates
			*   b = number, bias update
 			*/

			propigate: function (w, b) {

				this.updateBias(bias, b);

				weights = this.correctWeights(weights, w);

				return this;
			},

			/**
			*  @train: trains the perceptron on preset training data with expected results, returns the perceptron
			*
			*   i = [number], inputs
			*   o = [number], previous outputs
			*   d = [number], expected outputs
 			*/

			train: function (i, o, d) {

				this.update(i, this.errors(o, d));

				return this;
			},

			/*	
			*  @update: updates the weights of the perceptron, returns the perceptron
			*		
			*	i = [number], input
			*	e = number, error
			*/

			update: function (i, e) {

				weights = this.updateWeights(weights, i, e, learningRate);

				return this;
			},

			/*
			*	@activate: returns 1 or -1, representing binary output in response to its inputs
			*
			*	w = [number], weights
			* 	i = [number], input
			*	b = nuber, bias
			*/

			activate: function (w, i, b) {

				product = sum.add(dotProduct(w, i));

				return output = sigmoid.modifiedBipolar(dotProd + b)); 
			},

			/*
			*  @weightProduct: returns the dot product of an input array and this perceptron's weights
			*	
			*	i = [number], input
			*/

			weightProduct: function (i) {

				return sum.add(dotProduct(weights, i));
			},

			/*
			*  @dotProduct: returns the sum of the last calculated dot product of the perceptron
			*
			*/

			dotProduct: function () { 

				return product; 
			},

			/*
			*  @output: returns the last calculated output of the perceptron
			*
			*/

			output: function () {

				return output;
			},

			/*
			*  @updateWeights: returns updated weights for the perceptron
			*	
			*	w = [number], weights
			*	i = [number], input
			*	e = number, error
			*	lr = number, learning rate
			*/

			updateWeights: function (w, i, e, lr) {
				
				var weights = [], l = w.length;

				if (l !== i.length) {

					throw new Error("Weights must be the same length as inputs for update.", "perceptron.js");
				}
				
				while (l--) {

					weights[l] = w[l] + (e * input[l] * lr);
				}

				return weights;
			},

			/*
			*  @correctWeights: returns corrected weights for the perceptron
			*	
			*	w = [number], weights
			*	i = [number], input
			*/

			correctWeights: function (w, i) {
				
				var weights = [], l = w.length;

				if (l !== i.length) {

					throw new Error("Weights must be the same length as inputs for correction.", "perceptron.js");
				}
				
				while (l--) {

					weights[l] = w[l] + i[l];
				}

				return weights;
			},

			/*
			*  @updateBias: returns an updated bias value for the perceptron
			*
			*	b = number, bias
			*	e = number, error
			*/

			updateBias: function (b, e) { 

				return bias = (b + e);
			},

			/*
			*  @errors: returns the amount of cumulative error between the expected and actual outputs
			*
			*	o = [number], actual outputs
			*	e = [number], expected outputs
			*/

			errors: function (o, d) {
				
				var e = 0, l = o.length;

				if (p.constructor !== Array || d.constructor !== Array || l !== d.length) {

					throw new Error("The first and second arguments of errors must be arrays of the same length.", "perceptron.js");
				}
				
				while (l--) {

					e += this.error(o[l], d[l]);
				}

				return e;
			},

			/*
			*  @error: returns the amount of error between desired and actual output
			*
			*	o = number, output
			*	e = number, desired
			*/

			error: function (o, d) { 

				return o - d; 
			},

			/**
			*  @initWeights: initializes weights to maximize learning speed
			*
			*   weights = [number], this layer's weights
			*	scale = number, calculated from the number of layers and inputs
			*/

			initWeights: function (weights, scale) {

				var divisor = Math.sqrt(sum.squares(weights));

				var l = weights.length;

				while (l--) {

					weights[l] = (scale * weights[l]) / divisor;
				}

				return weights;
			},

			/**
			*  @initialize: initializes weights and bias to maximize learning speed
			*
			*   scale = number, calculated from the number of layers and inputs
			*/

			initialize: function (scale) {

				weights = initWeights(weights, scale);

				bias = random.ranged(-scale, scale);

				return this;
			},

			save: function () {

				return {
					size: size,
					weights: weights,
					bias: bias,
					learningRate: learningRate
				};
			}
		};
	}();
};