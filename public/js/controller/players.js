app = require('../settings/app.js');
app.map = require('../controller/map.js');
app.dom = require('../tools/dom.js');
Player = require('../objects/player.js');

module.exports = function () {

	var current, players = [], defeated = [],
	
	setProperties = function (property, value, index) {
        var setting = property.substring(7).toLowerCase();
        var index = index !== undefined ? index : property.getNumber() - 1;
        if (players[index]) players[index][setting] = setting === 'co' ? app.co[value](players[index]) : value;
        if (app.user.player() && app.user.number() === index + 1)
            socket.emit('setUserProperties', {property:setting, value: value, index:index});
    },

    exists = function (player) {

		var i = 0, length = players.length;

        while ((p = players[i++]))
            if(p.id() === player.id())
                return players.splice(x,1,p)[0];

        return false;
    },

    addPlayer = function (player){

        // check if player is already in and replace if they are
        if(player && players.length <= app.map.players()){

            // get the attributes of the co from game and add them to player object
            var id = 'player'+player.number+'co';
            var value = app.dom.getDefault(document.getElementById(id));
            if(!value && player.co) value = player.co;

            player.number = players.length + 1;
            player = new Player(player);

            if(!exists(player)) players.push(player);

            if (value) setProperties(id, value);

            return true;
        }
        return false;
    };

	return {

		setProperty:setProperties,
		changeProperty: function(p){
            var children = document.getElementById('player' + (p.index + 1) + p.property).childNodes;
            var length = children.length;

            for(var i = 0; i < length; i += 1){
                var equal = children[i].getAttribute('class') === p.value;
                children[i].style.display = equal ? 'block' : 'none';
            }
            setProperties(p.property, p.value, p.index);
        },
        empty: function () { return !players.length; },
        first: function () { return players[0]; },
        last: function () { return players[players.length - 1]; },
       	next: function () { return current === this.last() ? this.first() : players[current.number()]; },
        all: function () { return players.concat(defeated); },
        length: function () { return players.length; },
        add: function (player) {
        	if(player.length)
        		for(var i = 0; i < player.length; i+=1)
        			addPlayer(player[i]);
        	else addPlayer(player);
        	return current = players[0];
        },

        // cheack if all players are present and ready
		ready: function () {
            var length = app.map.players();
            for(i = 0; i < length; i += 1)
            	if (!players[i] || !players[i].ready()) 
                    return false;
            return true;
        },

        get: function (object) {
        	var i, all = players.concat(defeated);
        	for(i = 0; i < all.length; i += 1)
        		if(all[i] && object.id() == all[i].id())
        			return all[i];
        	return false;
        },

        reset: function () { return players.splice(0, players.length); },    

        current: function () { return current; },

        setCurrent: function (player) { current = player; },

        defeated: function () { return defeated; },

        defeat: function (player) {
            defeated.concat(players.splice(player.index(), 1));
            if(app.players.length() <= 1)
                return app.game.end();
            alert('player '+player.number()+' defeated');
        },

        indexOf: function (object) {
            for (var i = 0; i < players.length; i += 1)
                if(players[i].id() === object.id())
                    return i;
            return false;
        },

        number: function (number) {
            for (var i = 0; i < players.length; i += 1)
                if(players[i].number() == number)
                    return players[i];
            return false;
        },

        remove: function(player, cp){

            var i, index = player.index(), player = app.players.get(player); 

            if(player){

                console.log(player);

                // make this more complex to handle redistribution of players
                for(i = index; i < players.length; i += 1)
                    document.getElementById('player' + players[i].number() + 'co').style.borderColor = 'white';

                return cp ?  players.splice(index, 1, cp) : players.splice(index, 1);
            }
            return false; 
        }
    };
}();