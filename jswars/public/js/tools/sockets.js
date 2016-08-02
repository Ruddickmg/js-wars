/* --------------------------------------------------------------------------------------*\

    handle socket connections

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.game = require('../game/game.js');
app.chat = require('../tools/chat.js');
app.modes = require('../menu/modes.js');
app.options = require('../menu/options.js');
app.key = require('../tools/keyboard.js');
app.maps = require('../controller/maps.js');
app.map = require('../controller/map.js');
app.players = require('../controller/players.js');
app.cursor = require('../controller/cursor.js');
app.background = require('../controller/background.js');
app.units = require('../definitions/units.js');

Validator = require('../tools/validator.js');
Player = require('../objects/player.js');
Unit = require('../objects/unit.js');

var validate = new Validator('sockets');
var socket = io.connect("http://127.0.0.1:8080");

socket.on('setMap', function (map) {app.game.setMap(map)});
socket.on('start', function (game) {app.menu.start();});
//socket.on('player', function (player) { app.players.add(player); });
socket.on('userAdded', function (message) {app.chat.display(message);});
socket.on('gameReadyMessage', function (message) {app.chat.display(message);});
socket.on('propertyChange', function (properties) {app.players.changeProperty(properties);});
socket.on('readyStateChange', function (player) {
    app.players.get(new Player(player)).isReady(player.ready);
});

socket.on('addPlayer', function (player) {app.players.add(player);});
socket.on('addRoom',function (room) { app.maps.add(room); });
socket.on('removeRoom', function  (room) { app.maps.remove(room); });

socket.on('disc', function (user) {
    app.chat.display({message:'has been disconnected.', user:user.name.uc_first()});
    app.players.remove(user);
});

socket.on('userLeft', function (user) {
    app.chat.display({message: 'has left the game.', user: user.name.uc_first()});
    app.players.remove(user);
});

socket.on('userRemoved', function  (user) {
    app.chat.display({message:'has been removed from the game.', user:user.name.uc_first()});
    app.players.remove(user);
});

socket.on('userJoined', function (user) {
    app.players.add(user);
    if(!user.cp) app.chat.display({message:'has joined the game.', user:user.name.uc_first()});
});

socket.on('joinedGame', function (joined) {
    app.background.set(joined.background);
    app.game.load(joined);
});

socket.on('back', function () {
    app.modes.boot();
    app.menu.back();
});

socket.on('cursorMove', function (move) {
    app.key.press(move);
    app.cursor.move(true);
});

socket.on('background', function (type) { app.background.set(type); });

socket.on('endTurn', function (id) {    
    if(validate.turn({id: function  () {return id;}}))
        app.options.end();
});

socket.on('addUnit', function (unit) {
    var u = unit._current;
    var player = app.players.get({id:function () {return u.player._current.id;}});
    var unit = new Unit(player, u.position, app.units[u.name.toLowerCase()]);
    if(validate.build(unit))
        if(player.canPurchase(unit.cost())) {
            player.purchase(unit.cost());          
            app.map.addUnit(unit);
        }
});

socket.on('attack', function (action) {
    if(validate.attack(action)) {
        var attacker = app.map.getUnit(action.attacker), 
        attacked = app.map.getUnit(action.attacked);
        attacker.attack(attacked, action.damage);
        if(app.user.owns(attacked) && !attacked.attacked())
            attacked.attack(attacker);
    }
});

socket.on('joinUnits', function (action) {
    if(validate.combine(action)) {
        var unit = app.map.getUnit(action.unit);
        var selected = app.map.getUnit(action.selected);
        selected.join(unit);
    }
});

socket.on('moveUnit', function (move) {
    var unit = app.map.getUnit(move);
    var target = move.position;
    if(validate.move(unit, target))
        unit.move(target, move.moved);
});

socket.on('loadUnit', function (load) {
    var passanger = app.map.getUnit({id:load.passanger});
    var transport = app.map.getUnit({id:load.transport});
    if(validate.load(transport, passanger))
        passanger.load(transport);
});

socket.on('unload', function (transport) { 
    var unit = app.map.getUnit(transport);
    unit.drop(transport, transport.index); 
});

socket.on('updatePlayerStates', function (players) { app.players.add(players); });

module.exports = socket;