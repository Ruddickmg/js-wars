// calculating rewards may be a useful tactic

var Layer = function (size, learningRate, bias, weights) {

	this.learningRate = learningRate || .3;
	this.bias         = bias;
	this.size         = size;
	this.weights      = weights || [];
	this.errors       = [];
	this.values       = [];
	this.outputs      = [];
		
	if(weights.length < 1)
		for (var i = 0; i < size; i += 1)
			this.weights[i] = Math.random();
};

Layer.prototype.input = function (values) { this.input = values; };
Layer.prototype.setLearningRate = function (speed) { this.learningRate = speed; };
Layer.prototype.setBias = function (bias) { this.bias = bias; };
Layer.prototype.activate = function (input) {
	for (var i = 0; i < values.length; i += 1)
		this.outputs[i] = this.values[i] * this.weights[i];
};

Layer.prototype.signum = function (output) { return output == 0 ? 0 : output > 0 ? 1 : -1; };
Layer.prototype.output = function () {
	return this.signum(this.sum(this.outputs) + this.bias);
};

Layer.prototype.train = function (output, error) { 
	return weight - (this.learningRate * output); 
};

Layer.prototype.remember = function () { 
	return {
		size:         this.size,
		weights:      this.weights,
		bias:         this.bias,
		learningRate: this.learningRate
	};
};

bayesErrorRegression = function	(error) {
	for(i = 0, regression = 0; i < weights.length; i += 1)
		regression = weights[i] * input[i] + error;
	return regression;
};

module.exports = Layer;