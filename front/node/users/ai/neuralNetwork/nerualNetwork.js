/* -------------------------------------------------------------------------------------------- *\

	@ NeuralNetwork: contains an array of layers containing perceptrons that make up a neural net

		layers = [number] || [{

				size: number, 
				bias: number, 
				learningRate: number, 
				nodes:[{size: number, weights: [number], bias: number, learningRate: number}]

			}], defines the amount of layers and their sizes or contains an array of saved layers

	 	thresh = number, defines bias
	 	rate = number, defines learning rate

\* --------------------------------------------------------------------------------------------- */

var sum = require("../../tools/calulations/sum.js");
var layer = require("./layer.js");

module.exports = function (layers, rate, thresh) {

	if(!layers || layers.constructor === Array)
		throw new Error("The first argument of neuralNetwork must be an array", "neuralNetwork.js");

	return function () {

		/*
		*	@size: number, defines how many perceptrons will be in this layer
		*	@bias: number, used to offset zero while training perceptrons
		*	@learningRate: number, used as a step size while training perceptrons
		*	@network: [layer], holds the layers in this network
		*/

		var bias = thresh || 1;
		var learningRate = rate || .3;
		var size = layers.length;

		var network = [];
		var previous = [];
		var states = [];

		var order = 0;
		var element, l = size;
		var outputLayer = size - 1;
		var num, scale = scaleFactor();

		while (l--) {

			element = layers[l];

			if (isNaN(element)) {

				layer(element.size, element.learningRate, element.bias, element.nodes):
			
			} else {

				node = layer(element, learningRate, bias);

				if (l < outputLayer && l > 0) {

					node.initialize(element);
				}
			}

			network[l] = node;
		}

		return {

			/*
			*  @backPropigate: starts back propigation through the network
			*	
			*	error = number, calculated error for the previous output of this network
			*/

			backPropigate: function (error) {

				return this.propigate(error, network);
			},

			/*
			*  @propigate: runs error propigation through the network
			*	
			*	error = number, calculated error for the previous output of this network
			*	network = [layer], this networks layers
			*/

			propigate: function (error, network) {
				
				var errors = this.errors(error, this.outputLayer());

				for (var i = network.length; i > 1; i -= 1) {

					errors = network[i].backPropigate(errors);
				}
			},

			/*
			*  @forward: feeds input forward through the network
			*	
			*	layers = [layer], this networks layers
			*	input = [number], an array of input for the network
			*/

			forward: function (layers, input) {
				
				for (var i = 0, l = layers.length; i < l; i += 1) {

					input = this.feed(layers[i], input);
				}

				return input;
			},

			/*
			*  @feed: feeds input into specified layer
			*	
			*	layer = layer, a layer of the network
			*	input = [number], an array of input for the specified layer
			*/

			feed = function (layer, input) {

				return layer.feedForward(input);
			},

			/*
			*  @errors: calculates errors of the output layer for back propigation
			*	
			*	error = number, calculated error for this networks previous outputs
			*	layer = layer, the networks output layer
			*/

			errors: function (error, layer) {

				var errors = [];
				var l = layer.size();

				while (l--) {

					errors[l] = error * layer.get(l).output(); 
				}

				return errors;
			},

			/*
			*  @save: saves the state of the neural network
			*
			*/

			save = function() {
				
				var l = network.length, raw = [];

				while (l--) {

					raw[l] = network[l].save();
				}

				return raw;
			}
		};
	}();
};