app = require('../settings/app.js');
app.map = require('../controller/map.js');
app.dom = require('../tools/dom.js');
app.menu = require('../menu/menu.js');
app.keys = require('../tools/keyboard.js');
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
        for (var id, i = 0; i < players.length; i += 1){
            id = isNaN(player.id) ? player.id() : player.id;
            if (players[i].id() === id)
                return i;
        }
        return false;
    },

    addPlayer = function (player, number) {

        // check if player is already in and replace if they are
        if(player && players.length <= app.map.players()){

            // get the attributes of the co from game and add them to player object
            var id = 'player'+ (number || player.number) +'co';  // <--- why doesnt the player.number property work???!!!
            var element = document.getElementById(id);
            var index = exists(player), value = app.dom.getDefault(element);
            
            if(!value && player.co)
                value = player.co;

            player.number = index === false ? players.length + 1 : players[index].number();
            player = new Player(player);

            if (index !== false) players.splice(index, 1, player);
            else players.push(player);

            if (value) setProperties(id, value);
            return true;
        }
        return false;
    },

    shiftPlayers = function (index) {

        // get currently selected co
        var selected = app.dom.getDefault(document.getElementById('player'+ app.user.player().number() +'co'));

        // move each player after the removed player down one
        for (i = index; i < players.length; i += 1)
            players[i].setNumber(i + 1);

        // generate id for new player location
        var co = 'player'+app.user.player().number()+'co';

        // move arrows to correct position
        app.keys.press(app.keys.left());
        app.menu.arrowsTo(co);

        // change co to match players original selection
        setProperties(co, selected);
        app.dom.changeDefault(selected, document.getElementById(co));
        
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
        			addPlayer(player[i], i + 1);
        	else addPlayer(player);
        	return current = players[0];
        },

        // check if all players are present and ready
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

            // make this more complex to handle redistribution of players
            var i, index = exists(player);

            if (index !== false) {

                // if there is a specified computer replacement or the game has started
                if (cp || app.game.started())

                    // then replace the player with the ai or undefined
                    players.splice(index, 1, cp)

                else {

                    // remove player
                    players.splice(index, 1);

                    // adjust players to make up for the disconnected player
                    if (players.length >= index) 
                        shiftPlayers(index);
                }
            }
        }
    };
}();