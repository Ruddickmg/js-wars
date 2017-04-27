"use strict";

const backend = require("../connections/backend.js");

function room(id, game) {

    return function (id, game) {

        const
            // creationDate = game.created || new Date().getTime(),
            category = game.category,
            players = game.players,
            indexOf = (id) => players.reduce((desiredIndex, player, index) => {

                return player.id === id && isNaN(desiredIndex) ? index : desiredIndex;
            });

        return {

            id: () => id,
            getGame: () => game,
            name: () => game.name,
            hasStarted: () => game.started,
            wasSaved: () => game.saved,
            category: () => category,
            isEmpty: () => !this.users().length,
            isFull: () => players.length >= game.max,
            size: () => players.length,
            all: () => players.slice(),
            getPlayer: (player) => players[indexOf(player)],
            addAi: (aiPlayer) => players.splice(aiPlayer.index(), 0, aiPlayer),
            delete: (id) => backend.del_game(id),
            isSameAs(room) {

                return ["id", "name", "created"].reduce((isTheSame, property) => {

                    return this[property] === room[property] && isTheSame;

                }, true);
            },
            add(player) {

                players.push(player);

                return this;
            },
            getAiPlayers() {

                return players.reduce((aiPlayers, player) => {

                    if (player.isComputer) {

                        aiPlayers.push(player)
                    }

                    return aiPlayers;

                }, []);
            },
            users() {

                return players.reduce((users, player) => {

                    if (!player.isComputer) {

                        users.push(player);
                    }

                    return users;

                }, []);
            },
            removePlayer(player) {

                const index = indexOf(player);

                if (!isNaN(index)) {

                    return players.splice(index, 1)[0];
                }
            }
        };

    } (id, game);
}

module.exports = room;