Room = function (id, game, index) {
    this.id = id;
    this.index = index;
    this.players = [];
    if (game && game.name) {
        this.name = game.name;
        this.category = game.category;
        this.max = game.max;
        this.settings = game.settings;
        this.map = game.map;
    } else this.name = game;
};
Room.prototype.empty = function () { return !this.users().length; };
Room.prototype.full = function () { return this.size() >= this.max; };
Room.prototype.size = function () { return this.players.length; };
Room.prototype.add = function (player) {
	this.players.push(player);
    player.number = this.players.length;
    player.setRoomName(this.name);
};
Room.prototype.getPlayer = function (player) {return this.players[this.indexOf(player)];};
Room.prototype.removePlayer = function (player) {this.players.splice(this.indexOf(player), 1);};
Room.prototype.addAi = function (aiPlayer) {this.players.splice(aiPlayer.index(), 0, aiPlayer);};
Room.prototype.remove = function (socket) {

    var index = false;

    if (!isNaN(socket)) delete this.players[socket];

    else if ((index = this.indexOf(socket.player)) !== false) {

        var wasFull = this.full();

        this.players.splice(index, 1);

        if (this.category) {
           	if (this.empty()) {
                socket.broadcast.to('lobby').emit('removeRoom', this);
                return this;
            } else if (wasFull) {
                socket.broadcast.to('lobby').emit('addRoom', this);
                socket.leave(this.name);
            }
        }
    }
    return false;
};

Room.prototype.indexOf = function (player) {
    var id = player._current ? player._current.id : player.id;
    for (var i = 0, len = this.size(); i < len; i += 1)
        if(this.players[i].id === id)
            return i;
    return false;
};

Room.prototype.aiPlayers = function () {
    var players = this.players, aiPlayers = [];
    for (var i = 0, len = players.length; i < len; i += 1)
        if (players[i].isComputer)
            aiPlayers.push(players[i]);
    return aiPlayers.length ? aiPlayers : false;
};

Room.prototype.all = function () {return this.players;};
Room.prototype.users = function () {
	var i, users = [], players = this.players;
	for(i = 0, len = players.length; i < len; i += 1)
        if(!players[i].isComputer)
        	users.push(players[i]);
    return users;
};
module.exports = Room;