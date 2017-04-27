"use strict";

const
    identifier = require('../../tools/identity.js'),
    createAiPlayer = require('./aiPlayer.js');

function aiHandler() {

    let players = {};

    const
        identity = identifier(),
        addPlayer = (player, currentPlayers) => {

            const
                modifiedPlayers = currentPlayers.slice(),
                id = identity.get();

            modifiedPlayers[id] = player;

            return modifiedPlayers;
        },
        removePlayer = (id, currentPlayers) => {

            identity.remove(id);

            const modifiedPlayers = Object.assign({}, currentPlayers);

            delete modifiedPlayers[id];

            return modifiedPlayers;
        };

    return {

        get: (id) => players[id],
        remove: (...aiPlayers) => aiPlayers.forEach((ai) => {

            players = removePlayer(ai, players);
        }),
        add(ai) {

            const id = identity.get();

            players = addPlayer(new createAiPlayer(id, ai), players);
        }
    };
}

module.exports = aiHandler;