/* --------------------------------------------------------------------------------------*\

    handle socket connections

\* --------------------------------------------------------------------------------------*/

app = require('../../configuration/settings/app.js');
app.game = require('../controller/game.js');
app.chat = require('../../controller/chat.js');
app.options = require('../../menus/options/optionsMenu.js');
app.key = require('../../input/keyboard.ts');
app.maps = require('../controller/mapsHandler.js');
app.map = require('../controller/mapController.js');
app.players = require('../controller/players.js');
app.cursor = require('../../controller/cursorController.js');
app.background = require('../../effects/background.js');
app.units = require('../definitions/units.js');
app.confirm = require('../../controller/confirmation.js');

Validator = require('../tools/validator.js');
Player = require('../user/player.js');
Unit = require('../mapEditor/unit.js');
Teams = require('../../menus/teams.js');
unitController = require("../controller/unit.js");

module.exports = function (socket) {

    var validate = new Validator('sockets');

    // all in game commands
    socket.on('confirmSave', function (player) {

        app.confirm.save(app.players.getPlayer(player));
    });

    socket.on('confirmationResponse', function (response) {

        app.confirm.player(response.answer, app.players.getPlayer(response.sender));
    });

    socket.on('cursorMove', function (move) {

        app.key.press(move);

        app.cursor.move(true);
    });

    socket.on('background', function (type) { 

        app.background.set(type); 
    });

    socket.on('endTurn', function (id) {  

        if (validate.turn(id)) {

            app.options.end();
        }
    });

    socket.on('addUnit', function (unit) {

        var player = app.players.getPlayer(unitController.player(unit));

        if (validate.build(unit)) {

            if (playerController.canPurchase(player, unitController.cost(unit))) {

                playerController.purchase(player, unit.cost());  

                app.map.addUnit(unit);
            }
        }
    });

    socket.on('attack', function (action) {

        if (validate.attack(action)) {

            var attacker = app.map.getUnit(action.attacker);
            var attacked = app.map.getUnit(action.attacked);

            unitController.attack(attacker, attacked, action.damage);

            if (app.user.owns(attacked) && !unitController.attacked(attacked)) {

                unitController.attack(attacked, attacker);
            }
        }
    });

    socket.on('joinUnits', function (action) {

        if (validate.combine(action)) {

            var target = app.map.getUnit(action.unit);
            var selected = app.map.getUnit(action.selected);

            unitController.join(target, selected);
        }
    });

    socket.on('moveUnit', function (move) {

        var unit = app.map.getUnit(move);
        var target = move.position;

        if (validate.move(unit, target)) {

            unitController.move(target, move.moved, unit);

            app.animate("unit");
        }
    });

    socket.on('loadUnit', function (load) {

        var passanger = app.map.getUnit({id:load.passanger});
        var transport = app.map.getUnit({id:load.transport});

        if (validate.load(transport, passanger)) {

            unitController.load(passanger, transport);
        }
    });

    socket.on('delete', function (unit) { 

        app.map.removeUnit(unit); 
    });

    socket.on('unload', function (transport) { 

        var unit = app.map.getUnit(transport);

        unitController.drop(transport.index, transport, unit); 
    });

    socket.on('defeat', function (battle) {

        var player = app.players.getPlayer(battle.conqueror);
        var defeated = app.players.getPlayer(battle.defeatedPlayers);

        playerController.playerDefeated(player, defeated, battle.capturing);
    });

    // all setup and menu commands
    socket.on('setMap', function (map) {

        app.game.setMap(map);
    });

    socket.on('start', function (game) {

        app.game.start();
    });

    socket.on('userAdded', function (message) {

        app.chat.post(message);
    });

    socket.on('gameReadyMessage', function (message) {

        app.chat.post(message);
    });

    socket.on('propertyChange', function (properties) {

        app.players.changeProperty(properties);
    });

    socket.on('readyStateChange', function (player) {

        var player = app.players.getPlayer(player);

        playerController.isReady(player);

        app.players.checkReady();
    });

    socket.on('addPlayer', function (player) {

        app.players.addPlayer(player);
    });

    socket.on('addRoom',function (room) {

        app.maps.addPlayer(room);
    });

    socket.on('removeRoom', function(room) {

        app.maps.removePlayer(room);
    });

    socket.on('disc', function (user) {

        app.chat.post({
            message: 'has been disconnected.', 
            user: user.name.uc_first()
        });

        app.players.removePlayer(user);
    });

    socket.on("userLeftRoom", function (game) {

        app.maps.removePlayer(game.getRoom, game.player);
    });

    socket.on('userLeft', function (user) {

        app.chat.post({
            message: 'has left the game.', 
            user: user.name.uc_first()
        });

        app.players.removePlayer(user);
        app.players.checkReady();
    });

    socket.on('userRemoved', function  (user) {

        app.chat.post({
            message:'has been removed from the game.', 
            user:user.name.uc_first()
        });

        app.players.removePlayer(user);
    });

    socket.on('userJoined', function (user) {

        app.players.addPlayer(user);

        if (!playerController.isComputer(user)) {

            app.chat.post({
                message:'has joined the game.', 
                user:user.name.uc_first()
            });
        }
    });

    socket.on('joinedGame', function (joined) {

        app.game.load(joined);
    });

    socket.on('back', function () { 

        Teams.boot(); 
    });

    socket.on('getPlayerStates', function () {

        socket.emit("ready", app.user.player());
    });

    return socket;
};