/* --------------------------------------------------------------------------------------*\

    handle socket connections

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
//app.game = require('../menu/game.js');
app.chat = require('../tools/chat.js');
//app.modes = require('../menu/modes.js');
app.actions = require('../game/actions.js');
app.options = require('../game/options.js');

var socket = io.connect("http://127.0.0.1:8080") || io.connect("http://jswars-jswars.rhcloud.com:8000");

socket.on('player', function(player){app.game.setPlayer(player);});
socket.on('userAdded', function(message){app.chat.display(message);});
socket.on('gameReadyMessage', function(message){app.chat.display(message);});
socket.on('propertyChange', function(properties){app.game.changeProperties(properties);});
socket.on('readyStateChange', function(player){app.game.playerReady(player);});
socket.on('addPlayer', function(player){app.game.addPlayer(player);});
socket.on('room', function(room){app.game.room(room);});
socket.on('addRoom',function(room){app.game.addRoom(room);});
socket.on('removeRoom', function(room){app.game.removeRoom(room);});
socket.on('disc', function(user){
    app.chat.display({message:'has been disconnected.', user:user.name.uc_first()});
    app.game.removePlayer(user);
});
socket.on('userJoined', function(user){
    app.game.addPlayer(user);
    if(!user.cp) app.chat.display({message:'has joined the game.', user:user.name.uc_first()});
});
socket.on('userLeft', function(user){
    app.chat.display({message:'has left the game.', user:user.name.uc_first()});
    app.game.removePlayer(user);
});
socket.on('userRemoved', function (user) {
    app.chat.display({message:'has been removed from the game.', user:user.name.uc_first()});
    app.game.removePlayer(user);
});

socket.on('back', function(){app.modes.boot();app.game.back();});
socket.on('cursorMove', function(move){app.keys.push(move);});
socket.on('attack', function(attack){app.actions.attack(attack);});
socket.on('joinUnits', function(combine){app.actions.combine(combine);});
socket.on('capture', function(capture){app.actions.capture(capture);});
socket.on('endTurn', function(){app.options.end();});
socket.on('moveUnit', function(move){
    app.map[move.type][move.index].x = move.x;
    app.map[move.type][move.index].y = move.y;
    window.requestAnimationFrame(app.animate('unit'));
});

module.exports = socket;