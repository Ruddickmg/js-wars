/* --------------------------------------------------------------------------------------*\
    
    Score.js calculates the game score

\* --------------------------------------------------------------------------------------*/

ScoreElement = require('../objects/scoreElement.js');
Score = function (previous) {

	this.parameters = [
	
		'moneyMade', 
		'moneySpent', 
		'mileage', 
		'damageRecieved', 
		'damageDone', 
		'buildingsCaptured',
		'buildingsLost',
		'buildingsHeld',
		'unitsHeld',
		'defeated',
		'conquered'
	];

	this.moneyMade = new ScoreElement('moneyMade', 2);
	this.moneySpent = new ScoreElement('moneySpent', -2);

	this.mileage = new ScoreElement('mileage', -1);

	this.damageRecieved = new ScoreElement('damageRecieved', -3); 
	this.damageDone = new ScoreElement('damageDone', 3);

	this.unitsLost = new ScoreElement('unitsLost', -4);
	this.unitsDestroyed = new ScoreElement('unitsDestroyed', 5);
	this.unitsHeld = new ScoreElement('unitsHeld', 3);

	this.buildingsCaptured = new ScoreElement('buildingsCaptured', 5);
	this.buildingsHeld = new ScoreElement('buildingsHeld', 6);
	this.buildingsLost = new ScoreElement('buildingsLost', -7);

	this.defeated = new ScoreElement('defeated', -70);
	this.conquered = new ScoreElement('conquered', 50);
	this.turns = [];

	this.score = 0;

	if (previous) {

		this.init(previous);
	}
};

Score.prototype.income = function (money) { 

	this.moneyMade.amount += (money / 1000); 
};

Score.prototype.expenses = function (money) { 

	this.moneySpent.amount += (money / 1000); 
};

Score.prototype.fuel = function (fuel) { 

	this.mileage.amount += (fuel / 10); 
};

Score.prototype.buildings = function (owned) { 

	this.buildingsHeld.amount = owned; 
};

Score.prototype.capture = function () { 

	this.buildingsCaptured.amount += 1; 
};

Score.prototype.lostBuilding = function () { 

	this.buildingsLost.amount += 1; 
};

Score.prototype.damageTaken = function (damage) { 

	this.damageRecieved.amount += (damage / 10); 
};

Score.prototype.damageDealt = function (damage) { 

	this.damageDone.amount += (damage / 10); 
};

Score.prototype.units = function (owned) { 

	this.unitsHeld.amount = owned; 
};

Score.prototype.lostUnit = function () { 

	this.unitsLost.amount += 1; 
};

Score.prototype.destroyedUnit = function () { 

	this.unitsDestroyed.amount += 1; 
};

Score.prototype.defeat = function () { 

	this.defeated.amount += 1; 
};

Score.prototype.conquer = function () { 

	this.conquered.amount += 1; 
};

Score.prototype.amount = function (parameter) {

	return this[parameter].amount; 
};

Score.prototype.setAmount = function (parameter, amount) {

	this[parameter].amount = amount;
};

Score.prototype.add = function (parameter, amount) {

	this[parameter].amount += amount;
};

Score.prototype.worth = function (parameter) {

	return this[parameter].worth; 
};

Score.prototype.turn = function () { 

	return this.turns.length; 
};

Score.prototype.allTurns = function () { 

	return this.turns 
};

Score.prototype.update = function(turn) {

	var scope = this;

	this.parameters.forEach(function (parameter) {

		scope.add(parameter, turn.amount(parameter));
	});

	this.turns.push(turn);
};

Score.prototype.calculate = function () {

	var scope = this;

	return Math.ceil(this.parameters.reduce(function (prev, parameter) {

		return prev + scope.amount(parameter) * scope.worth(parameter);
	}));
};

Score.prototype.display = function () {

	return {

		units: this.unitsHeld.amount,
		lost: this.unitsLost.amount
	};
};

Score.prototype.raw = function () {

	var scope = this, score = {};

	this.parameters.forEach(function (parameter) {
		score[parameter] = scope.amount(parameter);
	});

	score.turns = this.turns;

	return score;
};

Score.prototype.init = function (score) { 

	var scope = this;

	this.parameters.forEach(function (parameter) {

		scope.setAmount(parameter, score[parameter].amount);
	});

	this.turns = score.turns;
};

module.exports = Score;