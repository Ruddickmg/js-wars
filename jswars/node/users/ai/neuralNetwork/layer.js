/* -------------------------------------------------------------------------------------------- *\

	@ Layer: contains an array of perceptrons, one of 2 or more that will make up a neural network 

		layerSize = number, defines the amount of perceptrons in the layer

	 	perceptrons = number || [{size: number, weights: [number], bias: number, learningRate: number}], 
	 	defines the amount of expected input for each perceptron, or contains an array of saved perceptrons 
	
	 	thresh = number, defines bias
	 	rate = number, defines learning rate

\* --------------------------------------------------------------------------------------------- */

var perceptron = require("./perceptron.js");
var repeat = require("../../tools/repeat.js");
var initFromSavedLayer = require("./initSavedLayer.js");

module.exports = function (layerSize, perceptrons, thresh, rate) {

	return function () {

		/*
		*	@size: number, defines how many perceptrons will be in this layer
		*	@bias: number, used to offset zero while training the perceptron
		*	@learningRate: number, used as a step size while training the perceptron
		*	@nodes: [perceptron], holds the perceptrons for this layer
		*/

		var learningRate = rate || .3;
		var bias = thresh;
		var size = layerSize;
		var input, output, nodes = [];

		if (!isNaN(perceptrons)) {

			for (var i = 0; i < size; i += 1) {

				nodes.push(perceptron(perceptrons, bias, learningRate));
			}
		
		} else if (perceptrons.constructor === Array) {

			nodes = initFromSavedLayer(perceptrons);

		} else {

			throw new Error("The second argument of \"layer\" must be a number or array.", "layer.js");
		}

		return {

			/*
			*  @setLearningRate: sets the learning rate to its input, returns the layer
			*
			*	r = number, learningRate
			*/

			setLearningRate: function (r) { 

				learningRate = r; 
			},

			/*
			*  @setBias: sets the bias to its input, returns the layer
			*
			*	b = number, bias
			*/

			setBias: function (b) { 

				bias = b; 
			},

			/*
			*  @feedForward: returns the results of calling feed while passing nodes in
			*
			*	v = [number], array of input values 
			*/

			feedForward: function (v) { 
				
				return output = this.feed(nodes, (input = v));
			},

			/*
			*  @feed: returns an output of classifications from each of its perceptrons on the input
			*
			*	n = [perceptron], perceptrons
			*	v = [number], input values
			*	o = [number], output values
			*/

			feed: function (n, v) {

				var l = n.length;
				var o = [];

				while (l--) {

					o[l] = n[l].classify(v);
				}

				return o;
			},

			/*
			*  @train: the perceptrons on the data backpropigated through the network
			*
			*	s = number, current score
			*	p = number, previous score
			*/

			train: function (s, p) {

				nodes = this.update(nodes, s, p);

				return this;
			};

			/*
			*  @update: updates this layers perceptrons with the calculated back propigation error
			*	
			*	n = [perceptron], this layers perceptrons
			*	s = number, current score
			*	p = number, previous score
			*/

			update: function (n, s, p) {

				var l = n.length;
				var o = [];

				while (l--) {

					o[l] = n[l].train(s, p);
				};

				return o;
			},

			/*
			*  @updateWeights: updates this layers weighta
			*	
			*	weights = [number], this layers weights
			*	nodes = [perceptron], all perceptrons of this layer
			*/

			updateWeights: function (weights, nodes) {

				var l = nodes.length;

				while (l--) {

					nodes[l].propigate(weights);
				}
			},

			/*
			*  @calculateError: calculates error for back propigation
			*	
			*	e = number, error
			*	p = number, last calculated dot product of a perceptron
			*/

			calculateError: function (e, p) { 

				return e * sigmoid.modifiedBipolarPrime(p); 
			},

			/*
			*  @calculateBias: calculates bias updates for back propigation
			*	
			*	lr = number, learning rate
			*	e = number, error
			*/

			calculateBias: function (lr, e) { 

				return lr * e; 
			},

			/*
			*  @calculateWeights: calculates weight updates for back propigation
			*	
			*	i = [number], last calculated inputs of a layer
			*	bc = number, bias correction update
			*/

			calculateWeights: function (i, bc) { 

				var weights = [];
				var l = i.length;

				while (l--) {

					weights[l] = sigmoid.modifiedBipolar(i[l]) * bc; 
				}

				return weights;
			},

			/*
			*  @updateWeightsAndBias: updates each perceptrons weights and biases for back propigation
			*	
			*	nodes = [perceptron], layers perceptrons
			*	weights = [number], calculated weight updates
			*	bias = [number], calculated bias updates
			*/

			updateWeightsAndBias: function (nodes, weights, bias) {

				var node, l = nodes.length;

				while (l--) {

					nodes[l].propigate(weights[l], bias[l]);
				}
			},

			/*
			*  @backPropigate: back propigates errors through the layer
			*	
			*	errors = [perceptron], calculated errors from the next layer
			*/

			backPropigate: function (errors) {

				var calculated = this.propigate(nodes, errors, learningRate, input);

				this.updateWeightsAndBias(nodes, calculated.weight, calculated.bias);

				return calculated.error;
			},

			/*
			*  @propigate: calculates errors, bias and wieghts for propigation
			*	
			*	nodes = [perceptron], this layer's perceptrons
			*	errors = [number], calculated errors from the next layer
			*	rate = number, learning rate
			*	input = [number], this layer's last recieved input
			*/

			propigate: function (nodes, errors, rate, input) {

				var weights = [], bias = [], error = [];
				var l = nodes.length;
				var node, product;

				while (l--) {

				 	node = nodes[l];

					error[l] = this.calculateError(node.weightProduct(errors), node.dotProduct());

					bias[l] = this.calculateBias(rate, error[l]);

					weights[l] = this.calculateWeights(input, bias[l]);
				}

				return {
					error: errors,
					weight: weights,
					bias: bias
				};
			},

			/*
			*  @cost: combines errors from previous iterations
			*	
			*	iterations = number, specifies how many iterations to look back on
			*/

			cost: function (iterations) {

				error * sigmoid.modifiedBipolarPrime(input);

				var c, length = Math.max(iterations, errors.length);

				for (var e, i = 0; i < length; i += 1) {

					c = ((e = errors[i]) * e);
				}

				return c / 2;
			},

			/*
			*  @scaleFactor: calculates a number to scale weights and biases based on the number of
			*    inputs and layers in the neural network in order to maximize the learning speed 
			*	
			*	i = number, number of inputs
			*	l = number, number of layers in network
			*/

			scaleFactor: function (i, l) {

				return .7 * (i ^ (1/(l - 2));
			},

			/*
			*  @initialize: starts initialization of perceptrons
			*	
			*	layers = number, amount of hidden layers in the neural network
			*/

			initialize: function (layers) {

				this.init(nodes, layers);

				return this;
			},

			/*
			*  @init: initializes each perceptron with weights adjusted to maximize learning speed
			*	
			*	nodes = [perceptron], this layer's perceptrons
			*	layers = number, amount of hidden layers in the neural network
			*/

			init: function (nodes, layers) {

				var scale = this.scaleFactor(size, layers);
				
				var l = nodes.length;

				while (l--) {

					nodes[l].initialize(scale);
				}
			},

			/*
			*  @get: returns the perceptron at the specified index
			*	
			*	i = number, index
			*/

			get: function (i) {

				if (isNaN(i)) {

					throw new Error("The first argument of \"get\" in layer, must be an integer.", "layer.js");
				}

				if (i < 0 || i >= nodes.length) {

					throw new Error("The index passed to \"get\" in layer is out of range.", "layer.js");
				}

				return nodes[i];
			},

			save: function () { 

				var node = [];
				var l = nodes.length;

				while (l--) {

					node[l] = nodes[l].save();
				}

				return {
					size: size,
					input: input,
					output: output,
					nodes: node,
					bias: bias,
					learningRate: learningRate
				};
			}
		};
	}();
};