Terrain = require('../objects/terrain.js');

Matrix = function(dimensions){
	this.dimensions = dimensions;
	this.matrix = [];
	this.dummies = [];
	for (var i = 0; i <= dimensions.x; i += 1)
		this.matrix.push([]);
};

Matrix.prototype.insert = function (element) {
	var p = element.position();
    return this.matrix[p.x][p.y] = element;
};

Matrix.prototype.remove = function (element) {
	var existing = this.get(element);
	if(existing.type() !== 'building') {
		if (element.type() === 'unit') {
			if(existing === element)
				this.insert(element.occupies());
		} else this.insert(new Terrain('plain', element.position()));
	}
	return element;
};

Matrix.prototype.position = function (p, init) {
	var e, d = this.dimensions;
	if (p.x <= d.x && p.x >= 0 && p.y <= d.y && p.y >= 0){
		if(!this.matrix[p.x][p.y] && !init) {
			this.dummies.push(p);
			this.insert(new Terrain('plain', p));
		}
		return this.matrix[p.x][p.y];
	}
	return false;
};

Matrix.prototype.clean = function () {
	for (var p, e, i = 0; i < this.dummies.length; i += 1){
		var p = this.dummies[i];
		if((e = this.matrix[p.x][p.y]) && e.type() !== "unit" && e.type !== "building")
			this.matrix[p.x][p.y] = undefined;
	}
	this.dummies = [];
};

Matrix.prototype.close = function (p) { this.matrix[p.x][p.y].closed = true; };
Matrix.prototype.get = function (element) {return this.position(element.position());};
Matrix.prototype.log = function () {
	console.log(' ');
	console.log('------- matrix --------');
	console.log(' ');
	for (var arr, x = 0; x < this.matrix.length; x += 1)
		for (var y = 0; y < this.matrix[x].length; y += 1)
			if(this.matrix[x][y]) console.log(this.matrix[x][y]);
	console.log('--------- end ---------');
	console.log(' ');
};
module.exports = Matrix;