/* ---------------------------------------------------------------------- *\
    
    Properties.js holds the properties of each map object

\* ---------------------------------------------------------------------- */

createProperty = require('../map/property.js');
obsticles = require('../definitions/obsticles.js');
Validator = require('../tools/validator.js');

module.exports = function () {

 //    Validator = require('../tools/validator.js');
 //    console.log(Validator);

	// var validate = new Validator('properties');
 //    var error = validate.hasElements(obsticles, ['wood','building','plain','mountain', 'unit']);

	// if (error) {

	//    throw error;
 //    }

    return {

        tallMountain: createProperty('Mountain', obsticles.mountain),
        tree: createProperty('Woods', obsticles.wood),
        hq: createProperty('HQ', obsticles.building),
        base: createProperty('Base', obsticles.building),
        plain: createProperty('Plains', obsticles.plain),
        unit: createProperty('Unit', obsticles.unit),
        snow: createProperty('Snow', obsticles.snow)
    };
}();