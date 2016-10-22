/* --------------------------------------------------------------------------- *\
    
    Validator.js is a tool to verify the correctness of data within the game

\* --------------------------------------------------------------------------- */

app = require('../settings/app.js');
app.players = require('../controller/players.js');
Building = require('../map/building.js');

Validator = function (fileName) {this.fileName = fileName;};
Validator.prototype.defined = function (element, name) {
	if(!element) return new Error(name.uc_first() + ' undefined.', this.fileName);
};

Validator.prototype.hasElements = function (elements, needed) {
	var i = 0, n, length = needed.length;
	if(!elements) return new Error('missing input', this.fileName);
	while (i < length){
		property = needed[i++];
		if (!elements[property])
			return new Error ('Missing property: ' + property + '.', this.fileName);
	}
	return false;
};

Validator.prototype.isCoordinate = function (coordinate) {
	if(!coordinate) return new Error('No coordinate found');
	var x = coordinate.x, y = coordinate.y;
    if (isNaN(x) || isNaN(y) || x < 0 || y < 0)
    	return new Error('Invalid coordinate: x:'+ x +', y:'+ y, this.fileName);
};

Validator.prototype.inRange = function (array, dimensions) {
	this.isCoordinate(dimensions);
    var e, i, l = array.length;
    for (i = 0, e = array[i]; i < l; i += 1)
        if (e.x > dimensions.x || e.y > dimensions.y || e.y < 0 || e.x < 0)
            return new Error('Element at index: '+ i +' is outside the specified dimensions.', this.fileName);
};

Validator.prototype.multiplePlayers = function (array) {
	for(var i = 1; i < array.length; i += 1)
		if(array[i] && array[i].player() !== array[0].player())
			return new Error('More then one player requred in game', this.fileName);
};

Validator.prototype.building = function (object) {
	return object instanceof Building;
};

Validator.prototype.map = function (map) {

	this.defined(map, 'map')

	this.isCoordinate(map.dimensions);

	for(element in map)
		if(element !== 'id')
			this.defined(map[element], 'map '+ element);

	this.inRange(map.terrain, map.dimensions);
	this.inRange(map.buildings, map.dimensions);
	if (map.units) this.inRange(map.units, map.dimensions);

	if(typeof map.name !== 'string')
		return new Error('Map name must be a string', this.fileName);

	if(typeof map.category !== 'string' || app.settings.mapCatagories.indexOf(map.category) < 0)
		return new Error('Map category name must be a string from the map catagory list', this.fileName);

	if(!map.buildings.length || map.buildings.length < 2)
		return new Error('There must be at least two buildings in a map', this.fileName);

	if(isNaN(map.players) || map.players < 2 || map.players > 8)
        return new Error('number of players must be numarical between 2 and 8, was set to: '+map.players+' players', this.fileName);
};

// ---------------------------------------------- socket communication ---------------------------------------

Validator.prototype.position = function (proposed) {
	var aPos = object.get().position();
	var pPos = proposed.position();
	return aPos.x === pPos.x && aPos.y === pPos.y;
};

Validator.prototype.health = function (proposed) {
	return proposed.get().health() === proposed.health();
};

Validator.prototype.damage = function (proposed) {
	return true;
};

Validator.prototype.capture = function (action) {
	var unit = action.unit.get(),
	building = action.building.get(),
	player = app.players.current();
	return player.owns(unit) 
		&& !player.owns(building) 
			&& unit.canCapture(building)
				&& this.position(action.unit)
					&& this.health(action.unit)
						&& this.position(action.building)
							&& this.health(action.building);
};

Validator.prototype.move = function (move) {
	return true;
};

Validator.prototype.attack = function (object) {
	return true;
};

Validator.prototype.combine = function (object) {
	return true;
};

Validator.prototype.load = function (transport, passanger) {
	return passanger.owns(passanger) && passanger.owns(transport) && transport.canTransport(passanger) && passanger.inMovementRange(transport);
};

Validator.prototype.build = function (unit) {
	return unit.player().turn()
		&& unit.player().gold() >= unit.cost();
};

Validator.prototype.turn = function (player) {
	return app.players.get(isNaN(player) ? player : {id:player}).turn();
};

module.exports = Validator;