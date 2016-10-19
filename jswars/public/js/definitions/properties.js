/* ---------------------------------------------------------------------- *\
    
    Properties.js holds the properties of each map object

\* ---------------------------------------------------------------------- */

app.property = require('../map/property.js');
app.obsticles = require('../definitions/obsticles.js');
Validator = require('../tools/validator.js');

module.exports = function () {
	var error, validate = new Validator('properties');
	if((error = validate.hasElements(app.obsticles, ['wood','building','plain','mountain', 'unit'])))
	   throw error;

    this.tallMountain = new app.property('Mountain', app.obsticles.mountain);
    this.tree = new app.property('Woods', app.obsticles.wood);
    this.hq = new app.property('HQ', app.obsticles.building);
    this.base = new app.property('Base', app.obsticles.building);
    this.plain = new app.property('Plains', app.obsticles.plain);
    this.unit = new app.property('Unit', app.obsticles.unit);
    this.snow = new app.property('Snow', app.obsticles.snow);
};