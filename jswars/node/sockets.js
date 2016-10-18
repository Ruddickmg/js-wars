/* ----------------------------------------------------------------------------------------------------------*\
    set up and handle socket io
\* ----------------------------------------------------------------------------------------------------------*/

Room = require('./room.js');
Rooms = require('./rooms.js');
Player = require('./player.js');
Identity = require('./tools/identity.js');
AiPlayer = require('./ai/aiPlayer.js');
AiController = require('./ai/controller.js');
Clients = require('./clients.js');
events = require('events'),

module.exports = function (io) {

    var inc = 0;
    var ai = new AiController();
    var rooms = new Rooms();
    var emitter = new events.EventEmitter();
    var clients = new Clients();

    return {

        // get rid of disconnected player objects after allowed amount of time
        flush: function (allowed) { return rooms.flush(allowed); },

        // get all rooms that arent already full
        open: function (category) { return rooms.open(category).open; },

        // get rooms that arent full but have started
        running: function (category) { return rooms.open().running; },

        // listen for socket communication
        watch: function (socket) {

            socket.joinRoom = function (room) {
                var emptyRoom;
                if(this.room && (emptyRoom = this.room.remove(this)))   
                    rooms.remove(emptyRoom);
                this.room = room;
                this.join(room.name);
                room.add(this.player);
                return room;
            };

            // add user to players
            socket.on('addUser', function (user) {
                socket.player = rooms.disconnected(user) || new Player(user, socket);
                clients.add(socket);
                socket.joinRoom(rooms.lobby());
                socket.emit('player', socket.player);
            });

            // all in game related commands
            socket.on('addUnit', function (unit) {socket.player.addUnit(unit, socket);});
            socket.on('moveUnit', function (unit) {socket.player.moveUnit(unit, socket);});
            socket.on('attack', function (unit) { socket.player.attack(unit, socket);});
            socket.on('joinUnits', function (units) { socket.player.join(units, socket);});
            socket.on('loadUnit', function (units) { socket.player.load(units, socket);});
            socket.on('unload', function (unit) { socket.player.unload(unit, socket);});
            socket.on('capture', function (building) { socket.player.capture(bulding, socket);});
            socket.on('endTurn', function (turn) { socket.player.endTurn(turn, socket);});
            socket.on('delete', function (unit) { socket.player.del(unit, socket);});
            socket.on('defeat', function (player) { socket.player.defeat(player, socket);});
            socket.on('cursorMove', function (cursor) { socket.player.moveCursor(cursor, socket);});

            // save confirmation between players
            socket.on('confirmSave', function (game) {socket.player.save(game, socket);});
            socket.on('confirmationResponse', function (game) {socket.player.confirm(game, socket);});

            socket.on('aiTurn', function (game) {ai.get(socket.room.getPlayer(game.ai)).process(game.room);});
            socket.on('start', function (game){ socket.broadcast.to(socket.room.name).emit('start', game); });
            socket.on('background', function (type) {
                if (socket.room.category) {
                    socket.room.background = type;
                    socket.broadcast.to(socket.room.name).emit('background', type);
                }
            });

            // going to have to change how rooms work.. socket room name must be unique (intigrate with id's)

            // all game menu and setup related commands
            socket.on('boot', function (booted) {
                var client, player, name = socket.room.name;
                if ((player = socket.room.getPlayer(booted))) {
                    (client = clients.get(player)).emit('back', true);
                    client.joinRoom(rooms.lobby());
                    socket.broadcast.to(name).emit('userRemoved', player);
                } else socket.broadcast.to(name).emit('userRemoved', false);
            });

            socket.on('ready', function (player) {
                socket.player.ready = player._current.ready;
                socket.broadcast.to(socket.room.name)
                    .emit('readyStateChange', socket.player);
            });
            
            socket.on('setUserProperties', function (p) {
                socket.room.getPlayer(p.player)[p.property] = p.value;
                socket.broadcast.to(socket.room.name).emit('propertyChange', p);
            });

            socket.on('gameReadyChat', function(message){socket.broadcast.to(socket.room.name).emit('gameReadyMessage', message);});
            socket.on('setMap', function(map){socket.broadcast.to(socket.room.name).emit('setMap', map);});
            socket.on('removeRoom', function (room) {
                room = rooms.get(room);
                if (room && room.remove(socket))               
                    ai.remove(rooms.remove(room).aiPlayers());
            });

            socket.on('join', function (r) {
                var room = rooms.get(r);
                socket.joinRoom(room);
                socket.emit('joinedGame', room);
                socket.broadcast.to(room.name).emit('userJoined', socket.player);
            });

            socket.on('addAiPlayer', function (player) {
                var room = socket.room;
                player.roomId = room.id;
                var aiPlayer = ai.add(player);
                room.addAi(aiPlayer);
                socket.broadcast.to(room.name).emit('aiPlayerAdded', aiPlayer);            
                if (room.full()) socket.broadcast.to('lobby').emit('removeRoom', room);
            });

            socket.on('removeAiPlayer', function (player) {
                var room = socket.room, aiPlayer = room.getPlayer(player);
                var wasFull = room.full();
                room.removePlayer(aiPlayer);
                ai.remove(aiPlayer);
                if (wasFull) socket.broadcast.to('lobby').emit('addRoom', room);
            });

            // create new game rooms
            socket.on('newRoom', function (game) {
                if (!rooms.get(game)) {
                    var room = rooms.add(game);
                    socket.joinRoom(room);
                    socket.broadcast.to('lobby').emit('addRoom', room);
                } else socket.emit('roomExists', game);
            });

            socket.on ('exit', function (boot) {
                socket.broadcast.to(socket.room.name)
                    .emit(boot ? 'userRemoved' : 'userLeft', socket.player);
                if (socket.room.remove(socket)) {
                    var room = rooms.remove(socket.room);
                    if (room) ai.remove(room.aiPlayers());
                }
            });

            socket.on('disconnect', function () {
                var room = socket.room;
                if (socket.player) clients.remove(socket);
                if (room) {

                    socket.leave(room.name);

                    if (socket.player) {
                        socket.broadcast.to(room.name)
                            .emit('disc', socket.player);

                        socket.player.previousRoom = { 
                            name: room.name, 
                            category: room.category, 
                            timeOfDisconnect: new Date()
                        };
                        socket.player.clear();
                        rooms.disconnect(socket.player);
                    }
                    if (room.remove(socket)) ai.remove(rooms.remove(room).aiPlayers());
                }
            });
        }
    };
};