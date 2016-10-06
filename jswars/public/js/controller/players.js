app = require('../settings/app.js');
app.map = require('../controller/map.js');
app.dom = require('../tools/dom.js');
app.key = require('../tools/keyboard.js');
Player = require('../objects/player.js');
AiPlayer = require('../objects/aiPlayer.js');
Teams = require('../menu/teams.js');

module.exports = function () {

	var current, players = [], defeated = [], elements = [], ready,
	
	setProperties = function (property, value, index) {
        var i = isNaN(index) ? property.getNumber() - 1 : index;
        if (players[i]) players[i].setProperty(property, value);
    },

    exists = function (player) {
        var id = player._current ? player._current.id : typeof (player.id) === 'function' ? player.id() : player.id;
        return players.findIndex(function (player) {return player.id() === id;});
    },

    addPlayer = function (player, number) {
        // check if player is already in and replace if they are
        if (players.length <= app.map.players()) {

            if (!player.isComputer) player = new Player(player);

            var number, index = exists(player);

            if (!isNaN(index)) {
                 players.splice(index, 1, player);
                 number = players[index].number();
            } else players.push(player);

            player.setNumber(number || (number = players.length));

            var element = Teams.playerElement(number);
            var value = element && !player.co ? element.co().value() : player.co;
            if (value) player.setCo(value);
            return true;
        }
        return false;
    },

    shiftPlayers = function (index) {
        var playerNumber = app.user.number();
        players.slice(index).forEach(function(player, index){
            var number = index + 1;
            player.setNumber(number);
            Teams.playerElement(number).co().changeCurrent(player.co.name.toLowerCase());
        });
        if (index < playerNumber) Teams.arrows.setPosition(Teams.playerElement(app.user.number()).co());
    },

    replacePlayer = function (player) {
        var index = exists(player);
        if (!isNaN(index)) {
            socket.emit('boot', players[index]);
            players[index] = new AiPlayer(index + 1);
        }
    },

    allReady = function () {
        var length = app.map.players();
        for(i = 0; i < length; i += 1)
            if (!players[i] || !players[i].ready()) 
                return false;
        return true;
    };

	return {
		setProperty:setProperties,
		changeProperty: function (p) { 
            var player = players[exists(p.player)];
            var property = p.property;
            var value = p.value;

            Teams.playerElement(player.number())[property]()
                .changeCurrent(value);

            player.setProperty(property, value);
        },
        setElements: function (e) {elements = e;},
        addElement: function (e) {elements.push(e);},
        element: function (number) {return elements[number - 1]},
        empty: function () { return !players.length; },
        first: function () { return players[0]; },
        last: function () { return players[players.length - 1]; },
       	next: function () { return current === this.last() ? this.first() : players[current.number()]; },
        other: function () { return players.filter(function (player) {player.id() !== app.user.id();});},
        all: function () { return players.concat(defeated); },
        length: function () { return players.length; },
        add: function (player) {
        	if (player.length) player.forEach(function (p, i) {addPlayer(p, i + 1);});
        	else addPlayer(player);
        	return current = players[0];
        },

        // check if all players are present and ready
		ready: function () { return ready; },
        checkReady:function(){ ready = allReady(); },
        get: function (object) {
            var id = typeof(object.id) === 'function' ? object.id() : object.id;
        	return this.all().find(function (player) {return player && id == player.id();});
        },
        reset: function () { players = []; return this;},    
        current: function () { return current; },
        setCurrent: function (player) { current = player; },
        defeated: function () { return defeated; },
        defeat: function (player) {
            defeated.concat(players.splice(player.index(), 1));
            if(app.players.length() <= 1) return app.game.end();
            alert('player '+player.number()+' defeated');
        },
        indexOf: function (object) {
            for (var i = 0; i < players.length; i += 1)
                if(players[i].id() === object.id())
                    return i;
            return false;
        },
        number: function (number) {
            if (app.game.started()) return players.find(function (player){return player.number() == number;});
            return (player = players[number - 1]) ? player : false;
        },
        names: function (players) {
            return players.reduce(function (prev, player, i, players) {
                var p = prev ? prev : '', len = players.length, name = player.name();
                var transition = (i + 1 < len ? (i + 2 < len ? ', ' : ' and ') : '');
                return p + name + transition;
            });
        },
        unconfirm: function () {players.map(function(element){element.unconfirm();});},
        replace: replacePlayer,
        remove: function (player) {

            var index, removed;
            if (app.game.started() && !player.isComputer) replacePlayer(player);
            else if (!isNaN((index = exists(player)))) {

                if((removed = players.splice(index, 1)[0]).isComputer && app.user.first())
                    socket.emit('removeAiPlayer', removed);

                if (players.length >= index + 1)
                    shiftPlayers(index);
            }
        }
    };
}();