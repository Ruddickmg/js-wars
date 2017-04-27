RLNetwork: function () {

	var error = 1;
	var actor = neuralNetwork([8, 11, 5]);
	var critic = neuralNetwork([3, 12, 5]);

	while (error > 0.1) {

		error = actor.backPropigate(G);
	}
};


incrimentalMean: function (current, mean, steps) {

	return mean + ((current -  mean) / steps);
};

Q: function (state, action) {

	return valueOfActionFromThisState;
};

EpsilonGreedy: function (epsilon) {

	(epsilon / numberOfActions) + (1 - epsilon)
	(epsilon / numberOfActions)

	return Math.random() < 0.5 ? randomAction() : bestAction();
};

glie: function (state, action) {
	

	numberOfTimesSeen = [];

	a = {state, action}

	numberOfTimesSeen[a] += 1

	epsilon = 1 / numberOfTimesSeen[a];

	value = Q(a) + epsilon * (actual - Q(a))
};

discount: function (q, amount) {
	return q -= (amount || 1);
};

TDLambda: function (number) {

	var rewards = [];
	var score = 0;
	var i = 0;

	for (var i = 0; i < number; i += 1) {

		score += discount(rewards[i], i);
	}

	return score + discount(Q(state, action), number);
};

sarsa: function (Qaction) {

	return Q(state, action) += (learningRate * (reward + discount(Q(nextState, nextAction)) - Q(state, action)))

};


sarsaQLambda: function () {

	sum = 0;

	for (var i = 0; i < something; i += 1) {
		sum += (lambda ^ (i - 1)) * TDLambdaSarsa(i);
	}

	return (1 - lambda) * sum
};

Eligability: function (state, action) {

	eligable = [];

	var decay = 0.9;

	var a = {state, action};

	eligable[a] = eligable[a] ? eligable[a] + 1 : 1;

	return eligable[a];

};

correctingByEligability: function () {

	return Q(state, action) += (learningRate * Eligability(state, action) * (reward + discount(Q(nextState, nextAction)) - Q(state, action)));
};

TDLambdaSarsa: function (number) {

	return sarsa(TDLambda(number));
};

network spits out expected reward somehow, error is calculated by the difference 
between expected reward (output by network) and actual reward from environment

pass in state of game and potential action, return 

have an array of x length (dependant on spacial needs), while the array is not full randomely select 
state action pairs to save in the array. once the array is full train the network on the saved data, 
frin then on generate a random indicie within the randge of the array, at random time intervals, updating the
the random indicie with the a different state action pair, after a certain amount of updates or time steps,
train the network on the old data again. recurrently until the training has finished