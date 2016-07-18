Position = function (x, y, relativePosition) {
	this.x = x;
	this.y = y;
	this.orientation = relativePosition;
};

Position.prototype.inMap = function (positions) {
    var dim = app.map.dimensions(); 
    return this.x >= 0 && this.y >= 0 && this.x < dim.x && this.y < dim.y;
};

Position.prototype.neighbors = function () {
    var x = this.x, y = this.y;
    var result = [];
    var positions = [
        new Position(x - 1, y, 'west'),
        new Position(x, y - 1, 'south'),
        new Position(x + 1, y, 'east'),
        new Position(x, y + 1, 'north')
    ];
	return this.filter(positions);
};

Position.prototype.corners = function () {
    var x = this.x, y = this.y;
    var positions = [
        new Position(x - 1, y - 1, 'northWest'),
        new Position(x + 1, y - 1, 'southEast'),
        new Position(x + 1, y + 1, 'northEast'),
        new Position(x - 1, y + 1, 'southWest')
    ];
    return this.filter(positions);
};

Position.prototype.filter = function (positions) {
	var result = [];
	for (var i = 0; i < positions.length; i += 1) 
		if (positions[i].inMap())
			result.push(positions[i]);
	return result;
};

Position.prototype.surrounding = function () {
	return this.neighbors().concat(this.corners());
};

Position.prototype.log = function () {
	console.log('{ x: '+this.x+ ', y: '+this.y+' }');
};

module.exports = Position;