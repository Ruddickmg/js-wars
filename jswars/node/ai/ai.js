Ai = function (player) {
	this.roomId = player.roomId;
	this.id = player.id;
};
Ai.prototype.process = function (game) {
	console.log(game);
};
module.exports = Ai;