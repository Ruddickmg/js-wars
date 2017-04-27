createPlayer = require("../user/player.js");
Score = require("../definitions/score.js");
composer = require("../tools/composition.js");
transmit = require("../sockets/transmitter.js");

module.exports = function (number) {
    
    var player = composer.exclude("isComputer").compose({

        mode: "cp",
        isComputer: true

    }, createPlayer({

        first_name: "HAL #" + number,
        id: "AI#"+number,
        ready: true,
        number: number

    }));

    if (app.user.first()) {

        transmit.addAi(player);
    }

    return player;
};