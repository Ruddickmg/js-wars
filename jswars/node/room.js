var Room = function (id, game) {
    if(id !== undefined){
        this.id = id;
        this.players = [];
    }

    if(game && game.name){
        this.name = game.name;
        this.category = game.category;
        this.max = game.max;
        this.settings = game.settings;
        this.map = game.map;
        this.full = false;
    } else this.name = game;
};

Room.prototype.add = function (player) {
	this.players.push(player);
    player.number = this.players.length;
    if(this.players.length >= this.max)
        this.full = true;
};

Room.prototype.remove = function (socket) {

    var index = this.indexOf(socket.player);

    if (index !== false)
        this.players.splice(index, 1);

    if (this.full && this.players.length < this.max) {
        this.full = false;
        socket.broadcast.to('lobby').emit('addRoom', this);
        socket.leave(this.name);
    }

   	if (this.category && this.users().length < 1) {
        socket.broadcast.to('lobby').emit('removeRoom', this);
   		return this;
    }

    return false;
};

Room.prototype.indexOf = function (player) {
    for (var i = 0; i < this.players.length; i += 1)
        if(this.players[i].id === player.id)
            return i;
    return false;
};

Room.prototype.users = function () {
	var i, users = [], players = this.players;
	for(i = 0; i < players.length; i += 1)
        if(!players[i].cp)
        	users.push(players[i]);
    return users;
};

module.exports = Room;