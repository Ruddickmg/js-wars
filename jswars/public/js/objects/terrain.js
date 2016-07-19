app = require('../settings/app.js');
app.properties = require('../definitions/properties.js');
Position = require('../objects/position.js');
Validator = require('../tools/validator.js');

Terrain = function (type, position) {

	var error, properties = new app.properties(),
    validate = new Validator('terrain'), property = properties[type];
    
    if((error = validate.defined('type', type) || validate.isCoordinate(position) || validate.hasElements(property, ['name', 'type', 'defense'])))
		throw error;

    this.n = property.name();
	this.t = property.type();
    this.d = property.type();
    this.pos = new Position(position.x, position.y);
	this.defense = property.defense;
    this.name = function () { return this.n; };
	this.draw = function () { return type; };
    this.position = function () { return new Position(this.pos.x, this.pos.y); };
};

Terrain.prototype.type = function () { return this.t; };
Terrain.prototype.draw = function () { return this.d; };
Terrain.prototype.class = function () { return 'terrain'; };
Terrain.prototype.on = function (object) {
    var objectPosition = object.position ? object.position() : object;
    var position = this.position();
    return position.x === objectPosition.x && position.y === objectPosition.y;
};

module.exports = Terrain;
