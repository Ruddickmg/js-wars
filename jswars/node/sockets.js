/* ----------------------------------------------------------------------------------------------------------*\
    set up and handle socket io
\* ----------------------------------------------------------------------------------------------------------*/
//var cron = require('cron');
var Room = require('./room.js');
var Player = require('./player.js');

module.exports = function () {

    var clients = {}; // holds sockets
    var rooms = {
        lobby: new Room(0, 'lobby'),
        disconnected: new Room (undefined, 'disconnected')
    };
    var roomId = 2;
    var usedId = [];

    // fix this 
    var recycleId = function () {
        var id = roomId += 1;
        var val = usedId[usedId.length - 1];
        while (id < val) {
            var len = usedId.length - 1;
            delete usedId[len];
            val = usedId[len - 1];
        }
        return roomId;
    };

    var removeRoom = function (room) {
        var cat = rooms[room.category];
        if(cat[room.name]) delete cat[room.name];
    };
    
    return { 

        // get rid of disconnected player objects after allowed amount of time
        flush: function (allowed) {
            var disconnected = rooms.disconnected;
            for(player in disconnected)
                if(disconnected[player].previousRoom 
                    && new Date() - disconnected[player].previousRoom.timeOfDisconnect > allowed)
                        delete disconnected[player];
        },

        // get all rooms that arent already full
        rooms: function (category) { 
            var room, open = {}, all = rooms[category];
            for(room in all)
                if (!all[room].full) 
                    open[room] = all[room];
            return open;
        },

        // listen for socket communication
        watch: function (socket) {

            socket.joinRoom = function (room) {
                var empty;
                if(this.room && (empty = this.room.remove(this)))
                    delete rooms[empty.category][empty.name];
                this.room = room;
                this.join(room.name);
                room.add(this.player);
                return room;
            };

            socket.on('boot', function (room) {
                var room = socket.room;
                if (room.player) {
                    room.remove(room.player);
                    socket.broadcast.to(room.player.socketId).emit('back', true);
                    socket.broadcast.to(room.name).emit('userRemoved', room.cp);
                }else{
                    socket.room.players.splice(room.cp.number - 1, 1);
                    socket.broadcast.to(name).emit('userRemoved', room.cp);
                }
            });

            socket.on('ready', function (player) {
                socket.player.ready = player._current.ready;
                socket.broadcast.to(socket.room.name)
                    .emit('readyStateChange', socket.player);
            });

            socket.on('getPlayerStates', function (game) { 
                socket.emit('updatePlayerStates', rooms[game.category][game.name].players);
            });
            
            socket.on('setUserProperties', function (p) {
                var players = socket.room.players;
                if (players.length) players[p.index][p.property] = p.value;
                socket.broadcast.to(socket.room.name).emit('propertyChange', p);
            });

            socket.on('gameReadyChat', function(message){socket.broadcast.to(socket.room.name).emit('gameReadyMessage', message);});
            socket.on('cursorMove', function(moved){socket.broadcast.to(socket.room.name).emit('cursorMove', moved);});
            socket.on('moveUnit', function(move){socket.broadcast.to(socket.room.name).emit('moveUnit', move);});
            socket.on('addUnit', function(unit){socket.broadcast.to(socket.room.name).emit('addUnit', unit);});
            socket.on('setMap', function(map){socket.broadcast.to(socket.room.name).emit('setMap', map);});
            socket.on('attack', function(attack){socket.broadcast.to(socket.room.name).emit('attack', attack);});
            socket.on('joinUnits', function(joinedUnits){socket.broadcast.to(socket.room.name).emit('joinUnits', joinedUnits);});
            socket.on('loadUnit', function(load){socket.broadcast.to(socket.room.name).emit('loadUnit', load);});
            socket.on('unload', function(transport){socket.broadcast.to(socket.room.name).emit('unload', transport);});
            socket.on('start', function(game){ socket.broadcast.to(socket.room.name).emit('start', game); });
            socket.on('capture', function(capture){ socket.broadcast.to(socket.room.name).emit('capture', capture);});
            socket.on('endTurn', function(end){socket.broadcast.to(socket.room.name).emit('endTurn', end);});
            socket.on('removeRoom', function (room) {
                room = rooms[room.category][room.name];
                if(room && room.remove(socket))
                    removeRoom(room); 
            });

            socket.on('join', function(room){
                socket.joinRoom(rooms[room.category][room.name]);
                socket.emit('joinedGame', room);
                socket.broadcast.to(room.name).emit('userJoined', socket.player);
            });

            socket.on('background', function (type) { 
                if(socket.room.category){
                    socket.room.background = type;
                    socket.broadcast.to(socket.room.name).emit('background', type);
                }
            });

            // create new game rooms
            socket.on('newRoom', function (game) {

                var room, id = usedId[0] ? usedId.shift() : recycleId();

                if(!rooms[game.category]) rooms[game.category] = {};
                if(!rooms[game.category][game.name]){

                    room = rooms[game.category][game.name] = new Room(id, game);
                    socket.joinRoom(room);
                    socket.broadcast.to('lobby').emit('addRoom', room);

                } else socket.emit('roomExists', game);
            });

            socket.on ('exit', function (boot) {
                socket.broadcast.to(socket.room.name)
                    .emit(boot ? 'userRemoved' : 'userLeft', socket.player);
                socket.room.remove(socket);
            });

            // add user to players
            socket.on('addUser', function (user) {
                socket.player = rooms.disconnected[user.id] || new Player(user);
                socket.joinRoom(rooms.lobby);
                socket.emit('player', socket.player);
            });

            socket.on('disconnect', function () {

                var room = socket.room

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
                        rooms.disconnected[socket.player.id] = socket.player;
                    }

                    if (room.remove(socket) && room.name !== 'lobby' && room.name !== 'disconnected')
                        removeRoom(room);
                }
            });
        }
    };
}();