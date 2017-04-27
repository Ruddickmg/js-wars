"use strict";

const isString = (string) => string.constructor === String;

function client(socket) {

    return function (initialSocket) {

        let
            room = undefined,
            player = undefined,
            socket = initialSocket;

        const broadcast = (path, value, roomName=room.name) => {

            if (!isString(roomName)) {

                throw new Error(`No room name supplied to hidden method: "broadcast"`, "client.js");
            }

            socket.broadcast
                .to(roomName)
                .emit(path, value);
        };

        return {

            emit: socket.emit,
            room: () => room,
            socket: () => socket,
            player: () => player,
            broadcast(path, value) {

               broadcast(path, value);

                return this;
            },

            emitToLobby(path, value) {

                broadcast(path, value, "lobby");

                return this;
            },

            joinRoom(currentRoom) {

                if (room && player) {

                    room.removePlayer(player);
                }

                room = currentRoom;

                socket.join(room.name);

                if (player) {

                    room.add(player);
                }

                return room;
            },
            setPlayer(currentPlayer) {

                player = currentPlayer;

                return this;
            },
            setSocket(currentSocket) {

                socket = currentSocket;

                return this;
            },
            disconnect() {

                socket.leave(room.name());

                if (room.wasSaved()) {

                    broadcast("userLeftRoom", {room, player});
                }

                if (player) {

                    broadcast("disconnected", player);
                }

                room.remove(player);

                return this;
            }
        };

    }(socket);
}

module.exports = client;