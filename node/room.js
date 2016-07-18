var room = function (id, game) {
    if(id !== undefined){
        this.id = id;
        this.players = [];
    }
    if(game){
        this.name = game.name;
        this.category = game.category;
        this.max = game.max;
        this.settings = game.settings;
        this.map = game.map;
        this.full = false;
    }
};

room.prototype.add = function (player) {
	this.players.push(player);
    player.number = this.players.length;
    if(this.players.length >= this.max)
        this.full = true;
};

room.prototype.remove = function (socket) {

    var index = this.indexOf(socket);

    if(index !== false)
        this.players.splice(index, 1);

    if(this.full && this.players.length < this.max){
        this.full = false;
        socket.broadcast.to('lobby').emit('addRoom', this);
    }

   	if(this.category && this.users().length < 1){
        socket.broadcast.to('lobby').emit('removeRoom', this);
   		return this;
    }
    return false;
};

room.prototype.indexOf = function (s) {
    for (var i = 0; i < this.players.length; i += 1)
        if(this.players[i].id === s.player.id)
            return i;
    return false;
};

room.prototype.users = function () {
	var i, users = [], players = this.players;
	for(i = 0; i < players.length; i += 1)
        if(!players[i].cp)
        	users.push(players[i]);
    return users;
};

module.exports = room;