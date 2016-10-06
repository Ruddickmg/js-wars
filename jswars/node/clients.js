Clients = function () { this.all = []; };
Clients.prototype.add = function (client) {this.all[client.player.id] = client;};
Clients.prototype.get = function (id) {return this.all[id.id || id];};
Clients.prototype.remove = function (client) {return this.all.splice(client.player.id, 1)[0];};
module.exports = Clients;