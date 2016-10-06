Identity = require('../tools/identity.js');
AiPlayer = require('./aiPlayer.js');
AiController = function (io) {
	this.identifier = new Identity();
	this.players = {};
	this.io = io;
};
AiController.prototype.get = function (player) {return this.players[player.id];};
AiController.prototype.remove = function (aiPlayers) {
	if (Array.isArray(aiPlayers)) for (var i = 0; i < aiPlayers.length; i += 1)
		this.removePlayer(aiPlayers[i]);
	else if (aiPlayers) this.removePlayer(aiPlayers);
};
AiController.prototype.removePlayer = function (player) {
	var id = player.identity;
	this.identifier.remove(id);
	delete this.players[id];
};
AiController.prototype.add = function (ai) {
	var id = this.identifier.get();
	return this.players[id] = new AiPlayer(id, ai);
};
module.exports = AiController;