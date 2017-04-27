"use strict";

function player(user, socket) {

    const
        broadcast = (socket, action, value) => socket.broadcast.to(socket.room.name).emit(action, value),

        properties = {

            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            name: user.screenName ? user.screenName : user.first_name,
            ready: false
        },

        methods = {

            setRoomName(name) {

                this.roomName = name;

                return this;
            },
            clear() {

                const player = object.assign({}, this);

                player.ready = false;

                return player;
            },
            addUnit: (unit, socket) => broadcast(socket, 'addUnit', unit),
            moveUnit: (move, socket) => broadcast(socket, 'moveUnit', move),
            attack: (attack, socket) => broadcast(socket, 'attack', attack),
            join: (joinedUnits, socket) => broadcast(socket, 'joinUnits', joinedUnits),
            load: (load, socket) => broadcast(socket, 'loadUnit', load),
            unload: (transport, socket) => broadcast(socket, 'unload', transport),
            capture: (capture, socket) => broadcast(socket, 'capture', capture),
            endTurn: (end, socket) =>  broadcast(socket, 'endTurn', end),
            del: (unit, socket) => broadcast(socket, 'delete', unit),
            defeat: (battle, socket) => broadcast(socket, 'defeat', battle),
            moveCursor: (moved, socket) => broadcast(socket, 'cursorMove', moved),
            save: (game, socket) => broadcast(socket, 'confirmSave', this),
            confirm: (response, socket) => broadcast(socket, 'confirmationResponse', {
                answer: response.answer,
                sender: this
            })
        };

    return Object.create(methods, properties);
}

module.exports = player;