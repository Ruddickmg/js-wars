#!/bin/env node
var express = require('express');
var request = require('request');
var application = express();
var bp = require('body-parser');
var server = require('http').createServer(application);
var io = require('socket.io')(server);
var con = {}; // holds connection variables
var clients = {}; // holds sockets
var rooms = {
    lobby:{ // holds list of active rooms
        name:'lobby',
        players:[]
    }
};

var roomId = 0;
var usedId = [];
var recycleId = function (id) {
    var val = usedId[usedId.length - 1];
    while (id < val){
        var len = usedId.length - 1;
        delete usedId[len];
        val = usedId[len - 1];
    }
};

var handle = function (value) {
    try{
        var req = value;
    }catch (e){
        console.log(e);
        req.abort();
        return {error:'get error'};
    }
    return req;
};

var copy = function (variable) {return JSON.parse(JSON.stringify(variable));};
var backend = function () {

    var url = 'http://back-jswars.rhcloud.com';

    var callback = function(response, res){
        var parsed = JSON.parse(response);
        console.log(response);
        res.json(parsed);
        res.end();
    };

    var api_get = function (path, input, res) {
        if (res.headersSent) {
            console.log(res);
            console.log('whaaa?');
        }else{
            return handle(request(url + path + input, function (error, response, body) {
                if (!error && response.statusCode == 200){
                    callback(body, res);
                }else{
                    console.log(response.statusCode);
                }
            }));
        }
    };

    var api_post = function (path, input, res) {
        if (res.headersSent) {
            console.log(res);
        }else{
            return handle(request.post({
                headers: {'content-type' : 'application/json'},
                url: url + path,
                body: JSON.stringify(input)
            }, function (error, response, body) {
                if (!error && response.statusCode == 200){
                    callback(body, res);
                }else{
                    console.log(response.statusCode);
                }
            }));
        }
    };

    return {
        get_maps: function (category, res) {
            return api_get('/maps/type/', category, res);  
        },
        get_map: function(id, res) {
            return api_get('/maps/select/', id, res);
        },
        save_map: function (map, res){
            return api_post('/maps/save', map, res);
        }
    };
}();

con.port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
con.ip = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '127.0.0.1';

if(!__dirname) __dirname = '/var/www';

application.use(express.static(__dirname + '/public'));
application.use(bp.json());

application.get('/', function (req, res) {res.sendFile(__dirname + '/index.html');});
application.get('/maps/type/:category', function (req, res){backend.get_maps(req.params.category, res);});
application.get('/maps/select/:id', function (req, res){backend.get_map(req.params.id, res);});
application.get('/games/:category', function (req, res){
    var category = req.params.category;
    var games = rooms[category];
    var response = games ? games : [];
    res.json(response);
    res.end();
});

application.post('/maps/save', function(req, res){backend.save_map(req.body, res);});
application.use(require('browser-logger')());
server.listen(con.port, con.ip, function(){console.log('listening on '+con.port+':'+con.ip);});

io.on('connection', function(socket){ 

    var removePlayer = function (s) {

        var remove = [];
        var room = s.room.name;
        var category = s.room.category;

        if(category){
            var players = rooms[category][room].players;
        }else{
            var players = rooms[room].players;
        }

        var len = players.length;
        if(s.fbid){

            for (var x = 0; x < len; x += 1){
                var id = players[x].fbid;
                if(id && id === s.fbid){

                    // add index of player that needs to be removed to remove array
                    remove.push(x);

                    // lower all player numbers after removed player
                    for(var z = 0; z < len; z += 1 ){
                        if(z > x){
                            players[z].number = z;
                        }
                    }
                }
            }

            if(category) console.log(players);

            var rlen = remove.length;
            for (var y = 0; y < rlen; y+=1){
                if(category){
                    rooms[category][room].players.splice(remove[y], 1);
                }else{
                    rooms[room].players.splice(remove[y], 1);
                }
            }
        }
    };

    var escape = function (v) {
        var r = v;
        return r;
    };

    var removeRoom = function(s){

        var room = s.room.name;
        var category = s.room.category;
        var r = category ? rooms[category][room] : false;

        if(r){
            var cpAndPlayers = r.players;
            console.log(cpAndPlayers);
            var cpLen = cpAndPlayers.length;
            var players = [];
            for(p = 0; p < cpLen; p += 1){
                var player = cpAndPlayers[p];
                if(!player.cp) players.push(player);
            }
            var len = players.length;
        }

        if(r && len <= 1){
            console.log('removeRoom');
            var id = r.id;
            if(id){
                recycleId(id);
                usedId.push(id);
            }
            console.log(players);
            socket.broadcast.to('lobby').emit('removeRoom', r);
            delete rooms[category][room];
        }else{
            removePlayer(socket);
        }
    }

    var player = function (){
        var name = socket.screenName ? socket.screenName : socket.first_name;
        return {
            id: socket.id,
            fbid: socket.fbid,
            first_name: socket.first_name,
            last_name: socket.last_name,
            name: name,
            ready: false
        };
    };

    var joinLobby = function (p) {
        socket.room = {
            name:'lobby',
            category:false
        };
        socket.join('lobby');
        rooms['lobby'].players.push(p);
    };

    var joinRoom = function (room) {

        var previousRoom = {
            room:{
                name:socket.room.name,
                fbid:socket.fbid,
                category:socket.category
            }
        };

        var name = socket.room.name = room.name;
        var category = socket.room.category = room.category;
        var p = player();

        if(!rooms[category]) rooms[category] = {};

        removePlayer(previousRoom);
        socket.leave('lobby');
        socket.join(name);

        return {
            name:name,
            category:category,
            player:p
        }
    };

    socket.on('boot', function (room){
        var name = socket.room.name;
        if(room.player){
            rooms[socket.room.category][name].players.splice(room.player.number,1,room.cp);
            socket.broadcast.to(room.player.id).emit('back', true);
            socket.broadcast.to(name).emit('userRemoved', room.cp);
        }else{
            var cp = room.cp;
            rooms[socket.room.category][name].players.splice(cp.number - 1,1);
            socket.broadcast.to(name).emit('userRemoved', cp);
        }
    });
    socket.on('ready', function(ready){ socket.broadcast.to(socket.room.name).emit('readyStateChange', ready);});
    socket.on('setUserProperties', function(p){
        var category = socket.room.category;
        var name = socket.room.name;
        if(rooms[category] && rooms[category][name] && rooms[category][name].players[p.index]){
            rooms[category][name].players[p.index][p.property] = p.value;
            console.log(p);
            socket.broadcast.to(name).emit('propertyChange', p);
        }
    });
    socket.on('gameReadyChat', function(message){socket.broadcast.to(socket.room.name).emit('gameReadyMessage', message);});
    socket.on('cursorMove', function(moved){socket.broadcast.to(socket.room.name).emit('cursorMove', moved);});
    socket.on('moveUnit', function(move){socket.broadcast.to(socket.room.name).emit('moveUnit', move);});
    socket.on('attack', function(attack){socket.broadcast.to(socket.room.name).emit('attack', attack);});
    socket.on('joinUnits', function(joinedUnits){socket.broadcast.to(socket.room.name).emit('joinUnits', joinedUnits);});
    socket.on('capture', function(capture){ socket.broadcast.to(socket.room.name).emit('capture', capture);});
    socket.on('endTurn', function(end){socket.broadcast.to(socket.room.name).emit('endTurn', end);});
    socket.on('join', function(room){
        if(room.players.length < room.max){
            var u = joinRoom(room);
            u.player.number = room.players.length + 1;
            rooms[u.category][u.name].players.push(u.player);
            socket.emit('player', u.player);
            socket.emit('room', rooms[u.category][u.name]);
            socket.broadcast.to(u.name).emit('userJoined', u.player);
        }else{
            socket.emit('gameFull');
        }
    });

    // create new  game rooms
    socket.on('newRoom', function(room){

        if(usedId[0]){
            var id = usedId.shift();  
        }else{
            roomId += 1;
            recycleId(roomId);
        }

        var r = joinRoom(room);
        r.player.number = 1;

        socket.emit('player', r.player);
        socket.emit('addPlayer', false);

        var rm = rooms[r.category][r.name] = {
            id:roomId,
            name:r.name,
            max:room.max,
            map:room.map,
            category:r.category,
            settings:room.settings,
            players:[r.player]
        };
        socket.broadcast.to('lobby').emit('addRoom', rm);
    });

    socket.on('exit', function(boot){
        var p = player();
        var room = socket.room.name;
        if(boot){
            socket.broadcast.to(room).emit('userRemoved', p);
        }else{
            console.log('leaving');
            socket.broadcast.to(room).emit('userLeft', p);
        }
        removeRoom(socket);
        socket.leave(room);
        joinLobby(p);
    });

    // add user to players
    socket.on('addUser', function(user){
        socket.fbid = user.id;
        if (user.screenName) socket.screenName = user.screenName;
        socket.first_name = user.first_name;
        socket.last_name = user.last_name;
        var p = player();
        socket.name = p.name;
        joinLobby(p);
        socket.emit('player', p);
    });

    socket.on('disconnect', function () {
        if(socket.room){
            var room = socket.room.name;
            removeRoom(socket);
            socket.leave(room);
            socket.broadcast.to(room).emit('disc', player());
        }
    });
});