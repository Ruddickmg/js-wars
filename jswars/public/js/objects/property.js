app = require('../settings/app.js');
Validator = require('../tools/validator.js');

module.exports = function (name, obsticle) {

	// var error, validate = new Validator('property');

	// if((error = validate.defined(name, 'name') || validate.hasElements(obsticle, ['type', 'defense'])))
	// 	throw error;

	this.type = obsticle.type;
	this.defense = obsticle.defense;
    this.name = function () { return name };
};