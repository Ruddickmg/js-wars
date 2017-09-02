app = require("../configuration/settings/app");
app.maps = require("../controller/mapsHandler.js");
app.user = require("../user/user.js");
app.testMap = require("../../game/map/testMap.js");

Join = require("./join/join.ts");
Settings = require("./settings/settings.js");
Teams = require("./teamSelection/teams.js");
Modes = require("./mode/modeMenu");
transmit = require("../communication/sockets/transmitter");

module.exports = function() {

    var join = function(game, category, type) {

        if (!game.map) {

            if (Join.back()) {
                
                return "back";

            } else {

                game.map = Join[category](type);
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

            Teams.removePlayer();

            // app.game.setPlayers(app.players.all());

            if (app.user.player() === app.players.moveToFirst()) {

                transmit.start(true);
            }

            return true;
        }
    };

    return {

        newgame: function() {

            return join("map", "open");
        },

        continuegame: function() {

            return join("game", "saved");
        },

        newjoin: function() {

            return join("game", "open");
        },

        continuejoin: function() {

            return join("game", "running");
        },

        mapdesign: function () {

            app.maps.save(app.testMap(), "testMap #1");

            app.game.reset();

            // if (!game.mapEditor) {
            //     game.mapEditor = Join.mapEditor();
            //     if (game.mapEditor) {
            //         if (game.mapEditor === "back") {
            //             delete game.mapEditor;
            //             return "back";
            //         }
            //         app.players.add(app.user.raw());
            //         app.cursor.editing();
            //         return "editor";
            //     }
            // }
        },

        joined: function() {

            return joined;
        },
    };
}();