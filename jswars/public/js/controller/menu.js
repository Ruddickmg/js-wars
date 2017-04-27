/* --------------------------------------------------------------------------------------*\

    menu.js holds handles the selection of game modes / logout etc.. <--- can be redone better

\* --------------------------------------------------------------------------------------*/

app = require("../settings/app.js");
app.maps = require("../controller/maps.js");
app.user = require("../user/user.js");
app.testMap = require("../map/testMap.js");

Join = require("../menu/join.js");
Settings = require("../menu/settings.js");
Teams = require("../menu/teams.js");
Modes = require("../menu/modes.js");
transmit = require("../sockets/transmitter.js");

module.exports = function () {

    var sent, boot, active, game = {};

    var exitSetupScreen = function () {

        var ss = document.getElementById("setupScreen");
        if (ss) ss.parentNode.removeChild(ss);                
    };

    var join = function (category, type) {

        // handle game selection
        if (!app.game.map()) {

            if (Join.back()) {
                
                return "back";

            } else {

                app.game.setMap(Join[category](type));
            }
        
        // handle settings selection
        } else if (category === "map" && !app.game.settings()) {

            if (Settings.back()) {

                app.game.removeMap().removeSettings();

            } else {

                app.game.setSettings(Settings.withArrows().select());
            }
        
        } else if (!app.game.started()) {

            if (Teams.back()) {

                // app.game.removePlayers();

            } else {

                Teams.withArrows().select();
            }
        
        } else {

            Teams.remove();

            // app.game.setPlayers(app.players.all());

            if (app.user.player() === app.players.first()) {

                transmit.start(true);
            }

            return true;
        }
    };
    
    return {

        boot: function () {

            boot = true
        },

        mode: function () {

            return Modes.select();
        },

        newgame: function () {

            return join("map","open");
        },

        continuegame: function () {

            return join("game","saved");
        },

        newjoin: function () {

            return join("game","open");
        },

        continuejoin: function () {

            return join("game","running");
        },

        mapdesign: function () {

            app.maps.save(app.testMap(), "testMap #1");

            app.game.reset();

            // if (!game.map) {
            //     game.map = Join.map();
            //     if (game.map) {
            //         if (game.map === "back") {
            //             delete game.map;
            //             return "back";
            //         }
            //         app.players.add(app.user.raw());
            //         app.cursor.editing();
            //         return "editor";
            //     }
            // }
        },

        COdesign: function () {

            alert("Co design is under construction");
        },

        store: function () { 

            alert("The game store is under construction");
        },

        joined: function () {

            return joined;
        },

        active: function () {

            return active;
        },

        activate: function () {

            active = true;
        },

        deactivate: function() {

            active = false;
        }
    };
}();