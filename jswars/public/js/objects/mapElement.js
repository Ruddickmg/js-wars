// map elements

module.exports = function (type, x, y, player) {
	this.type = type;
	this.position = {x:x, y:y};
	this.player = player;
};