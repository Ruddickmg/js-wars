Room = require('./room.js');
Identity = require('./tools/identity.js');
Rooms = function (identities) {
    this.identity = new Identity();
    this.all = {};
	this.categories = {
		lobby: new Room(this.identity.get(), 'lobby'),
    	disconnected: new Room (this.identity.get(), 'disconnected')
	};
};
Rooms.prototype.allowed = function (room) {return room.name !== 'lobby' && room.name !== 'disconnected';};
Rooms.prototype.disconnected = function (user) {return this.categories.disconnected[user.id];};
Rooms.prototype.disconnect = function (player) {this.disconnected[player.id] = player};
Rooms.prototype.lobby = function () {return this.categories.lobby;};

// might need to change room system, maybe use id instead of names? multiple games with same name will break it
Rooms.prototype.add = function (room) {
    var id = room.id || this.identity.get();
    if (this.allowed(room) && !this.get(room))
        return (this.category(room.category)[id] = (this.all[id] = new Room(id, room)));
};
Rooms.prototype.get = function (room) {return this.all[room.id];};
Rooms.prototype.category = function (category) { 
    return this.categories[category] ? this.categories[category] : (this.categories[category] = {});
};
Rooms.prototype.remove = function (room, saving) {
	if (!this.allowed(room)) return false;
    var removed, id = room.id, category = this.categories[room.category];
    if ((removed = category[id])) {
        delete category[id];
        delete this.all[id];
        if (!saving) this.identity.remove(id);
    }
    return removed;
};
Rooms.prototype.save = function (room) {return this.remove(room, true);};
Rooms.prototype.open = function (category) {
    var open = {}, running = {}, all = this.categories[category];
    for (var room in all)
        if (!all[room].full())
            if (all[room].started) running[room] = all[room];
            else open[room] = all[room];
    return {open: open, running: running};
};
Rooms.prototype.flush = function (allowed) {
    var disconnected = this.categories.disconnected;
    var players = disconnected.all();
    for (var player, now = new Date(), i = 0, len = players.length; i < len; i += 1)
        if ((player = players[i]).previousRoom && now - player.previousRoom.timeOfDisconnect > allowed)
                disconnected.remove(i);
};
module.exports = Rooms;