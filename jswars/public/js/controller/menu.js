/* --------------------------------------------------------------------------------------*\

    holds functions for the selection of game modes / logout etc.. <--- can be redone better

\* --------------------------------------------------------------------------------------*/

app = require('../settings/app.js');
app.maps = require('../controller/maps.js');
app.user = require('../user/user.js');
app.settings = require('../settings/game.js');
app.key = require('../input/keyboard.js');
app.testMap = require('../map/testMap.js');
app.editor = require('../game/mapEditor.js');
app.join = require('../menu/join.js');
Settings = require('../menu/settings.js');
Teams = require('../menu/teams.js');
Modes = require('../menu/modes.js');

module.exports = function () {

    var sent, boot, active, game = {};
    var exitSetupScreen = function () {
        var ss = document.getElementById('setupScreen');
        if (ss) ss.parentNode.removeChild(ss);                
    };
    
    return {
        boot: function () {boot = true},
        mode: function () {return Modes.select();},
        newgame: function () {

            // handle map selection
            if (!app.game.map()) {
                if (app.join.back()) return 'back';
                else app.game.setMap(app.join.map());
            }

            // handle settings selection
            if (app.game.map() && !app.game.settings()) {
                if (Settings.back()) app.game.removeMap().removeSettings();
                else app.game.setSettings(Settings.withArrows().select());
            }

            // handle co position and selection as well as joining the game
            if (app.game.map() && app.game.settings() && !app.game.players()) {
                if (Teams.back()) app.game.removeSettings();
                else app.game.setPlayers(Teams.withArrows().select());
            }

            if (app.game.map() && app.game.settings() && app.game.players()) {
                socket.emit('start', true);
                return true;
            }
        },
        continuegame:function () {alert('continue an old game is under construction. try new game or join new');},
        newjoin:function () {

            // handle game selection
            if (!app.game.map()) {
                if (app.join.back()) return 'back';
                else app.game.setMap(app.join.game());
            }

            if (app.game.map() && !app.game.started()) {
                if (Teams.back()) app.game.removeMap().removePlayers();
                else app.game.setPlayers(Teams.withArrows().select());
            }

            if (app.game.map() && app.game.started()) { // going to have to change to make up for first player start
                if (app.user.player() === app.players.first())
                    socket.emit ('start', true);
                return true;
            }
        },
        continuejoin: function () {alert('continue join is under construction, try new game or join new');},
        COdesign: function () {alert('design a co is under construction. try new game or join new');},
        mapdesign: function () {
            if (!game.map) {
                game.map = app.join.map();
                if (game.map) {
                    if (game.map === 'back') {
                        delete game.map;
                        return 'back';
                    }
                    app.players.add(app.user.raw());
                    app.cursor.editing();
                    return 'editor';
                }
            }
        },
        store: function () { alert('go to the game store is under construction. try new game or join new'); },
        joined: function () {return joined;},
        active: function () {return active;},
        activate: function () {active = true;},
        deactivate: function() {active = false;}
    };
}();