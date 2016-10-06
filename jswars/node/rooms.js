Room = require('./room.js');
Identity = require('./tools/identity.js');
Rooms = function (identities) {
    this.identity = new Identity();
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
    if (this.allowed(room) && !this.get(room))
        return (this.category(room.category)[room.name] = new Room(this.identity.get(), room));
};
Rooms.prototype.get = function (room) {if (this.categories[room.category]) return this.categories[room.category][room.name];};
Rooms.prototype.category = function (category) { return this.categories[category] ? this.categories[category] : (this.categories[category] = {});};
Rooms.prototype.remove = function (room) {
	if (!this.allowed(room)) return false;
    var removed, category = this.categories[room.category];
    if ((removed = category[room.name])) {
        delete category[room.name];
        this.identity.remove(room.id);
    }
    return removed;
};
Rooms.prototype.open = function (category) {
    var room, open = {}, running = {}, all = this.categories[category];
    for (room in all)
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