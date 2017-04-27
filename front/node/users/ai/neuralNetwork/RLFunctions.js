map: function (array, func) {

	var l = array.length;
	var mapped = [];

	while (l--) {

		mapped[l] = func(array[l]);
	}

	return mapped;
};

getMax: function (scores) {

	var l = scores.length;
	var highest = -Infinity;

	while (l--) {

		if (scores[l] > highest) {

			highest = scores[l];
		}
	};

	return highest;
};

softMax: function (scores) {

	var max = getMax(scores);

	var adjusted = map(scores, (score) => score - max);

	return Math.exp(max) / sum.exp(adjusted); 
};

// maybe???
softMaxPhi: function (stateActionVal, T) {

	var phi = (1 + Math.sqrt(5)) / 2;

	return math.exp(phi * stateActionVal * T);
};

softMaxScore: function () {
	
	return Q(scores[t]) - mean(scores);
};

gaussian: function (scores, variance) {
	
	return sum.variance(scores, variance);
};

gaussianScore: function (action, actions, variance) {

	return 	((action - mean(actions)) * feature) / variance; // what is feature??? possibly: Q(state)
}


eval: function (Q, actor) {

	return gradiant * Math.log(actor(state, action)) * Q(state, action);
}

updatw: function () {

	learningRate * this.eval(Q,actor);
}

distributeEvenly: function () {

}

advantage: function (state, action) {

	return QValue(state, action) - stateValue(state);
};

getIt: function (state, action, variance) {

	return gradient * Math.log(actor(state, action)) * advantage(state, action);
};


actor will sample actions from the environment amd recieve feedback from the value function (neuralNet)

model 


x[0] + sum(x[1..n])

bias + lr * dotProduct(input, weights);

error = (recieved - expected)

weight[i] += lr * weights[i] - error[i]

Math.exp();