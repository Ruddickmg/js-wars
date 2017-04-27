app = require('../settings/app.js');
Validator = require('../tools/validator.js');

module.exports = function (name, obsticle) {

	// var validate = new Validator("property.js");
	
	// var error = validate.isString(name) || validate.hasElements(obsticle, ['type', 'defense']);
	
	// if (error) {
	//
	//  	throw error;
	// }

	return {
		type: obsticle.type,
		defense: obsticle.defense,
	    name: name
	};
};