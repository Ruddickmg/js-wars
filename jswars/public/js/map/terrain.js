/* ---------------------------------------------------------------------- *\
    
    Terrain.js holds the terrain object, defining specific map terrain

\* ---------------------------------------------------------------------- */

app = require('../settings/app.js');
app.properties = require('../definitions/properties.js');
Position = require('../objects/position.js');
Validator = require('../tools/validator.js');
MapElement = require('../map/mapElement.js');

Terrain = function (type, position) {
	var error, properties = new app.properties();
    var validate = new Validator('terrain');
    var property = properties[type];
    
    if((error = validate.defined('type', type) || validate.isCoordinate(position) || validate.hasElements(property, ['name', 'type', 'defense']))){
        throw error;
    }

    this.n = property.name();
	this.t = property.type();
    this.d = property.type();
    this.pos = position;
	this.defense = property.defense;
    this.name = function () { return this.n; };
	this.draw = function () { return type; };
};

Terrain.prototype.raw = function () {return new MapElement(this.type(), this.position()); };
Terrain.prototype.type = function () { return this.t; };
Terrain.prototype.draw = function () { return this.d; };
Terrain.prototype.position = function () { return new Position(this.pos.x, this.pos.y); };
Terrain.prototype.class = function () { return 'terrain'; };
Terrain.prototype.on = function (object) {
    var objectPosition = object.position ? object.position() : object;
    var position = this.position();
    return position.x === objectPosition.x && position.y === objectPosition.y;
};

module.exports = Terrain;
