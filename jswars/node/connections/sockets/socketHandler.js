"use strict";

function socketHandler() {

    const sockets = {};

    return {
        getId: (socket) => sockets[socket],
        setId(socket, id) {

            sockets[socket] = id;

            return this;
        },
        remove(socket) {

            const id = sockets[socket];

            delete sockets[socket];

            return id;
        },
    };
}

module.exports = socketHandler;

