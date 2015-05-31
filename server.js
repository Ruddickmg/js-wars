#!/bin/env node
var express = require('express');
var application = express();
var server = require('http').Server(application);
var io = require('socket.io')(server);
var con = {}; // holds connection variables
var rooms = [{ // holds list of active rooms
    id:0, 
    name:'lobby',
    players:[]
}];

con.ip = process.env.OPENSHIFT_NODEJS_IP;
con.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

if (typeof con.ip === "undefined") {
    //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
    //  allows us to run/test the application locally.
    console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
    con.ip = "127.0.0.1";
};

application.use(express.static(__dirname + '/public'));

application.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

application.use(require('browser-logger')());

server.listen(con.port, con.ip, function(){
    console.log('listening on '+con.port+':'+con.ip);
});

io.on('connection', function(socket){

    // send cursor moves to other player games in the same game room for syncronization
    socket.on('cursorMove', function(moved){
        socket.broadcast.to(socket.room.name).emit('cursorMove', moved);
    });

    // send unit moves
    socket.on('moveUnit', function(move){
        socket.broadcast.to(socket.room.name).emit('moveUnit', move);
    });

    // send attacks
    socket.on('attack', function(attack){
        socket.broadcast.to(socket.room.name).emit('attack', attack);
    });

    // send joins
    socket.on('joinUnits', function(joinedUnits){
        socket.broadcast.to(socket.room.name).emit('joinUnits', joinedUnits);
    });

    // send capture statuses
    socket.on('capture', function(capture){
        socket.broadcast.to(socket.room.name).emit('capture', capture);
    });

    // send end turn signals
    socket.on('endTurn', function(end){
        socket.broadcast.to(socket.room.name).emit('endTurn', end);
    });

/*    // create new  game rooms
    socket.on('newRoom', function(room){
        var name = socket.screenName ? socket.screenName : socket.firstName;
        socket.broadcast.to(socket.room.name).emit('userLeft', socket.screenName );
        socket.leave(socket.room.name);
        socket.join(room.name);
        rooms.push({
            id:rooms.length,
            name:room.name,
            max:room.max,
            map:room.mapId,
            players:[socket];
        });
        socket.emit('updateRooms', rooms);
    });

    socket.on('exit', function(exit){
        socket.leave(exit.room.name);
        socket.join('lobby');
        rooms[0].players.push(socket);
        socket.room = rooms[0];
    });

    // join existing game
    socket.on('join', function(room){
        var name = socket.screenName ? socket.screenName : socket.firstName;
        if( room.status === 'full' || room.max && rooms[room.id].players.length => room.max){
            socket.to(socket.id).emit('full', 'cannot join room, max number of players reached');
        }else{
            socket.leave(socket.room);
            socket.join(room.name);
            if(room.max && socket.room.players.length = room.max - 1) rooms[socket.room.id].status = 'full';
            rooms[socket.room.id].players.push(socket);
            socket.room = rooms[socket.room.id];
            socket.broadcast.to(room.name).emit('userAdded', name + ' has joined the game');
        }
    });
*/
    // add user to players
    socket.on('addUser', function(user){
        socket.fbid = user.userID;
        if (user.screenName) socket.screenName = user.screenName;
        socket.firstName = user.firstName;
        socket.lastName = user.lastName;
        socket.join('lobby');
        rooms[0].players.push(socket);
        socket.room = rooms[0];
        var name = socket.screenName ? socket.screenName : socket.firstName;
        socket.broadcast.to('lobby').emit('userAdded', name + ' has joined the game');
    });
});