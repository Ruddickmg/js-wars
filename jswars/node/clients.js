Clients = function () { this.all = {}; };
Clients.prototype.add = function (client) {this.all[client.player.id] = client;};
Clients.prototype.get = function (id) {return this.all[id.id || id];};
Clients.prototype.remove = function (client) {
	var index = client.player ? client.player.id : client;
	var socket = this.all[index];
	delete this.all[index];
	return socket;
};
module.exports = Clients;