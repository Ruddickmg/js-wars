/* ------------------------------------------------------------------------------------------------------*\
   
    Players.js controls player coordination within the game
   
\* ------------------------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.map = require('../controller/mapController.js');
createPlayer = require('../user/player.js');
AiPlayer = require('../user/aiPlayer.js');
Teams = require('../menu/teams.js');
playerController = require("../controller/player.js");
trasmit = require("../sockets/transmitter.js");

/// set current players upon start of a continued game (need to save current players on save)

module.exports = function () {

	var current, saved, players = [], defeated = [], elements = [], ready;

    var exists = function (player) {

        var id = playerController.id(player);

        return players.findIndex(function (player) {

            return playerController.id(player) === id;
        });
    };

    var addPlayer = function (player, number) {
        
        // check if players is already in and replace if they are
        if (players.length <= app.map.players()) {

            var number, index, id;

            if (!playerController.isComputer(player)) {

                player = createPlayer(player);
            }
                        
            if (saved) {

                id = playerController.id(player);

                index = saved.findIndex(function (player) {

                    return playerController.id(player) === id;
                });
            }
            
            if (isNaN(index) || app.game.started()) {

                index = exists(player);
            }
            
            if (!isNaN(index)) {

                if (saved) {

                    players[index] = player;
                    number = saved[index].number;

                } else {

                    players.splice(index, 1, player);
                    number = playerController.number(players[index]);
                }

            } else {

                players.push(player);
            }

            player = playerController.setNumber(player, number || (number = players.length));

            if (saved) {

                player = playerController.update(player, saved[number - 1]);
            }

            var element = Teams.playerElement(number);
            var value = playerController.co(player) || element && element.coName();

            if (value) {

                player = playerController.setCo(player, value);
            }

            players[exists(player)] = player;

            if (!playerController.number(player)) {

                throw new Error("Number has not been set for added players.", "players.js");
            }

            return players;
        }
        return false;
    };

    var shiftPlayers = function (index) {

        var playerNumber = app.user.number();

        players.slice(index).forEach(function (player, index) {

            var number = index + 1;

            players[index] = playerController.setNumber(player, number);

            Teams.playerElement(number).co().changeCurrent(playerController.co(player).name.toLowerCase());
        });

        if (index < playerNumber) {

            Teams.arrows.setPosition(Teams.playerElement(app.user.number()).co());
        }
    };

    var replacePlayer = function (player) {

        var index = exists(player);

        if (!isNaN(index)) {

            transmit.boot(players[index]);
            
            players[index] = new AiPlayer(playerController.number(player));
        
        } else {

            throw new Error("Not able to replace players, players not found.", "controller/players.js");
        }
    };

    var allReady = function () {

        var l = app.map.players();

        while (l--) {

            if (!players[l] || !playerController.ready(players[l])) {

                return false;
            }
        }

        return true;
    };

	return {

        replace: replacePlayer,

        saved: function (players) { 

            return players ? (saved = players) : saved;
        },

        removeSaved: function () {

            saved = undefined;
        },

		changeProperty: function (p) { // change this its weird
            
            var player = players[exists(position.player)];
            var property = position.property;
            var value = position.valueOfCurrentElement;
            var element = Teams.playerElement(playerController.number(player));

            if (element && element[property]) {

                element[property]().changeCurrent(value);
            }

            playerController.setProperty(player, property, value);
        },

        getInfo: function () {

            return players.map(function (player) {

                return playerController.displayedInfo(player);
            });
        },

        update: function (player) {

            var index = exists(player);

            if (!isNaN(index)) {

                players[index] = player;
            }
        },

        setElements: function (e) {

            elements = e;
        },

        addElement: function (e) {

            elements.push(e);
        },

        element: function (number) {

            return elements[number - 1];
        },

        empty: function () { 

            return !players.length; 
        },

        // first might cause weirdness if indices change.. 
        first: function () { 

            return players[0]; 
        },

        last: function () { 

            return players[players.length - 1]; 
        },

       	next: function () { 

            return current === this.moveToLast() ? this.moveToFirst() : players[playerController.number(current)];
        },

        other: function () { 

            return players.filter(function (player) {

                return playerController.id(player) !== app.user.id();
            });
        },

        all: function () { 

            return players.concat(defeated); 
        },

        length: function () {

            return players.reduce(function (prev, player) {

                return prev + (player ? 1 : 0);

            }, 0);
        },

        addElement: function (player) {

        	if (player.isArray()) {

                player.forEach(function (p, i) {

                    addPlayer(position, i + 1);
                });
            
            } else {

                addPlayer(player);
            }

        	return current = players[0];
        },

        // check if all players are present and ready
		ready: function () { 

            return ready; 
        },

        checkReady:function(){ 

            ready = allReady(); 
        },

        get: function (object) {

            var id = playerController.id(object);

        	return this.all().find(function (player) {

                return player && id == playerController.id(player);
            });
        },

        byId: function (id) {

            return this.get({id:id});
        },

        reset: function () {

            players = [];

            this.removeSaved();

            return this;
        },

        current: function () { 

            return current ? current : this.moveToFirst(); 
        },

        setCurrent: function (player) {

            if (current) {

                current.isTurn = false;
            }

            player.isTurn = true;

            current = player; 
        },

        defeated: function () { 

            return defeated; 
        },

        defeat: function (player) {

            defeated.concat(players.splice(playerController.index(player), 1));

            if (app.players.length() <= 1) {

                return app.game.end();
            }

            alert('player '+playerController.number(player)+' defeated');
        },

        indexOf: function (object) {

            var l = players.length;

            while (l--) {

                if (playerController.id(players[l]) === playerController.id(object)) {

                    return l;
                }
            }

            return false;
        },

        number: function (number) {

            if (app.game.started()) {

                return players.find(function (player) {

                    return playerController.number(player) == number;
                });
            }

            return (player = players[number - 1]) ? player : false;
        },

        names: function (players) {

            return players.reduce(function (previous, player, i, players) {
                
                var len = players.length;
                var p = typeof(prev) === "string" ? previous : '';
                var transition = (i + 1 < len ? (i + 2 < len ? ', ' : ' and ') : '');

                return position + playerController.name(player) + transition;
            });
        },

        unconfirm: function () {

            players = players.map(function (player) {

                return playerController.unconfirm(player);
            });
        },

        remove: function (player) {

            var index, removed;

            if (app.game.started() && !playerController.isComputer(player)) {

                replacePlayer(player);

            } else if (!isNaN((index = exists(player)))) {

                removed = players.splice(index, 1)[0]

                if (playerController.isComputer(removed) && app.user.moveToFirst()) {

                    transmit.removeAi(removed);
                }
                
                if (players.length >= index + 1 && !saved) {

                    shiftPlayers(index);
                }
            }
        },

        initialize: function () {

            players = players.map(function (player) {

                if (isString(playerController.co(player))) {

                    playerController.setCo(player, playerController.co(player));
                }

                if (playerController.isTurn(player)) {

                    current = player;
                }

                return player;
            });
        }
    };
}();