var Layer = require('./neuralNetwork/layer.js');

// var network = NeuralNetwork([3, 6, 2], .3, 1);
var NeuralNetwork = function (nodes, learningRate, bias) {

	var bool, size, weights

	if(typeof(nodes) !== "array")
		throw new Error("input #1 of NeuralNetwork must be type array, "+ typeof(nodes) + " recieved.");

	if(!bias) bias = 1;

	if(!learningRate) 
		learningRate = .3;

	this.network = [];

	// for each layer, if the content is a pre existing layer (saved) then re initialize it
	// otherwise create a new layer with the specified parameters
	for (i = 0; i < nodes.length; i += 1) {

		// number of nodes in layer
		size = (bool = isNaN((level = nodes[i]))) ? level.size : [];

		// number of weights to set up for layer
		weights = bool ? level.weights : level;

		// create new layer with collected info
		this.network.push(new Layer(size, learningRate, bias, weights));
	}
	
	// order specifies how far back into the past to look
	// in order to correct errors
	this.order = 0;

	// previous layers
	this.previous = bool ? [nodes] : [];
};

// allow saving of current state
NeuralNetwork.prototype.save = function() {
	return this.network;
};

// auto regression function, takes array, error and order (how far back to look in the input)
NeuralNetwork.prototype.regress = function (target, order) {
	 return this.sum(this.previous, order) + this.error(target);
};

// calculate error
NeuralNetwork.prototype.error = function (target) {
	return this.previous - target;
};

// sums an array up to a specified index, sum full array if no index is supplied
NeuralNetwork.prototype.sum = function (array, order) {
	var total = 0, length = order || array.length;
	for(var i = 0; i < length; i += 1)
		total += array[i];
	return total;
};

var train = function (output, target, error) {

	if(!error) error = output - target;

	var side = output > 0 ? 1 : -1;

	if(target !== output)
		for(var i = 0; i < weights.length; i += 1)
			weights[i] = weights[i] + (side * error * inputs[i]);

};

// perceptron sum of weights and inputs
var perceptron = function (inputs) {
	for(var i = 0, value = 0; i < inputs.length; i += 1)
		value += inputs[i] * weights[i];
	return value + this.bias;
};

var systemIdentification = function (output, target) {
	for (var i = 0, error = []; i < output.length; i += 1)
		error.push(target[i] - output[i]);
	return error;
};

var inverseModeling = function (output, input) {
	for (var i = 0, error = []; i < output.length; i += 1)
		error.push(input[i] - output[i]);
	return error;
};

// euclidian distance can be used in identifying similar input, the smaller the distance the more alike the input must be, 
// knowledge can be 
// returns array of euclidian distances for each input if it is within range, otherwise false
var similarity = function (current, previous) {
	var distances = [], length = current.length;
	
	for (var i = 0; i < length; i += 1)	
		distances.push(distance(current[i], previous[i]));
	return sum(distances) < 2 ? distances : false;
};

var distance = function (current, previous) {
	return current - previous;
};

var cost = function (input, current, previous) {
	for(var total = 0, i = 0, length = current.length; i < length; i += 1)
		total += input[i] * distance(current[i], previous[i]);
	return total;
};

var trainViaCost = function (weights, inputs, current, previous) {
	for(var i = 0; i < weights.length; i += 1)
 		weights[i] = weights[i] + (this.learningRate * cost(inputs, current, previous));
 	return weights;
};



// classification network for unit identification, passes unit info into move network etc..

// score based on position -> have an evaluator for the board which ascertains the value or place of the players
// position i.e. if an infantry is on land that improves its defense/players vision/proximity to enemy base or 
// buildings (different buildings can have higher worth), etc.. all those factors will add to the overall score of 
// each movement, error is calculated to maximize total score at each iteration (compare current score to previous score, 
// if the score is worse, calculate error and change weights, if its the same either do nothing or add a small error, if 
// the score has improved, then do nothing/reward the ai)

// adjust weights when a unit takes damage? 
// (possibly only when damage brings units health lower then its attackers health at end of turn, allowing for swarm 
// attacks also taking into account value of each unit, i.e. infantry vs tank etc..(perhaps a seperate network can 
// ascertain value? if necessary))

// when one is lost

// maybe seperate networks handle movement, offense and defense.. combining somehow to utilize all information..