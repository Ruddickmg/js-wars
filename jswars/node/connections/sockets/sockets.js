"use strict";

const
    roomsController = require("../../rooms/rooms.js"),
    aiController = require("../../users/ai/controller.js"),
    clientHandler = require("../../clients/clients.js"),
    backend = require("../../connections/backend.js"),
    createPlayer = require("../../users/player.js");

function sockets() {

    const
        ai = aiController(),
        rooms = roomsController(),
        clients = clientHandler(),
        playerBySocket = (socket) => clients.bySocket(socket).player();

    return {

        removeDisconnected: (allowed) => clients.removeTimedOutDisconnections(allowed),
        getOpenRooms: (category) => rooms.open(category).open,
        getRunningRooms: (category) => rooms.open(category).running,
        saveGame: (user) => rooms.remove(clients.get(user.id).room().id()),
        reserveIds: (games) => rooms.addReservedIds(games),
        removeSaved: (id) => backend().del_game(id),
        updateUser(user, id, socket) {

            const
                client = clients.remove(id),
                lobby = rooms.lobby(),
                player = createPlayer(user);

            if (client) {

                if (lobby.removePlayer(id)) {

                    lobby.add(player);
                }

                clients.add(socket, id);
            }
        },

        matchRunningGames(games) {

            const reversedGameList = [];

            games.forEach((game) => {

                const storedGame = rooms.get(game);

                reversedGameList.push(storedGame || game);
            });

            return reversedGameList;
        },

        listenForSocketCommunication(socket) {

            socket.on("addUser", (user) => {

                const
                    player = createPlayer(user),
                    id = user.id;

                if (clients.wasDisconnected(id)) {

                    clients.reconnect(id).setSocket(socket);

                } else {

                    clients.add(socket, id).setPlayer(player);
                }

                clients.byId(id)
                    .joinRoom(rooms.lobby())
                    .emit("player", player);
            });

            socket.on("addUnit", (unit) => playerBySocket(socket).addUnit(unit, socket));
            socket.on("moveUnit", (unit) => playerBySocket(socket).moveUnit(unit, socket));
            socket.on("attack", (unit) => playerBySocket(socket).attack(unit, socket));
            socket.on("joinUnits", (units) => playerBySocket(socket).join(units, socket));
            socket.on("loadUnit", (units) => playerBySocket(socket).load(units, socket));
            socket.on("unload", (unit) => playerBySocket(socket).unload(unit, socket));
            socket.on("capture", (building) => playerBySocket(socket).capture(building, socket));
            socket.on("endTurn", (turn) => playerBySocket(socket).endTurn(turn, socket));
            socket.on("delete", (unit) => playerBySocket(socket).delete(unit, socket));
            socket.on("defeat", (player) => playerBySocket(socket).defeat(player, socket));
            socket.on("cursorMove", (cursor) => playerBySocket(socket).moveCursor(cursor, socket));
            socket.on("confirmSave", (game) => playerBySocket(socket).save(game, socket));
            socket.on("confirmationResponse", (game) => playerBySocket(socket).confirm(game, socket));
            socket.on("start", (game) => clients.bySocket(socket).broadcast("start", game));

            socket.on("aiTurn", (game) => {

                const
                    client = clients.bySocket(socket),
                    room = client.room(),
                    aiPlayer = room.getPlayer(game.ai);

                ai.get(aiPlayer).process(room)
            });

            socket.on("background", (type) => {

                const
                    client = clients.bySocket(socket),
                    room = client.room();

                room.getGame().background = type;
                client.broadcast("background", type);
            });

            // all game menu and setup related commands
            socket.on("boot", (booted) => {

                const
                    client = clients.bySocket(socket),
                    player = client.room().getPlayer(booted);

                if (player) {

                    client.emit("back", true);
                    client.joinRoom(rooms.lobby());
                    client.broadcast("userRemoved", player);

                } else {

                    client.broadcast("userRemoved", false);
                }
            });

            socket.on("ready", (isReady) => {

                const
                    client = clients.bySocket(socket),
                    player = client.player();

                player.ready(isReady);

                client.broadcast("readyStateChange", player);
            });
            
            socket.on("setUserProperties", (properties) => {

                let error = false;

                const
                    {player, property, value} = properties,
                    client = clients.bySocket(socket),
                    storedPlayer = client.room().getPlayer(player);

                if (storedPlayer) {

                    storedPlayer[property] = value;

                } else {

                    error = {error:"Player not found."};
                }

                client.broadcast("propertyChange", error || properties);
            });

            socket.on("gameReadyChat", (message) => {

                clients.bySocket(socket).broadcast("gameReadyMessage", message);
            });

            socket.on("setMap", (map) => socket.broadcast.to(socket.room.name).emit("setMap", map));

            // socket.on("removeRoom", (room) => {
            //
            //     const
            //         client = clients.bySocket(socket),
            //         storedRoom = rooms.get(room),
            //         aiPlayers = storedRoom.getAiPlayers();
            //
            //     if (storedRoom.removePlayer(client.player())) {
            //
            //         ai.remove(aiPlayers);
            //
            //     } else {
            //
            //         client.broadcast(boot ? "userRemoved" : "userLeft", socket.player);
            //     }
            // });

            socket.on("join", (room) => {

                const
                    client = clients.bySocket(socket),
                    storedRoom = rooms.get(room);

                if (storedRoom) {

                    client.joinRoom(storedRoom);
                    client.emit("joinedGame", storedRoom.getGame());
                    client.broadcast("getPlayerStates", true);
                    client.broadcast("userJoined", socket.player);

                } else {

                    console.log("Room not found in join.");
                }
            });

            socket.on("addAiPlayer", (player) => {

                const
                    client = clients.bySocket(socket),
                    room = client.room(),
                    aiPlayer = ai.add(player);

                // player.roomId = room.id;

                room.addAi(aiPlayer);

                client.broadcast("aiPlayerAdded", aiPlayer);

                if (room.isFull()) {

                    client.emitToLobby("removeRoom", room);
                }
            });

            socket.on("removeAiPlayer", (player) => {

                const
                    client = clients.bySocket(socket),
                    room = client.room(),
                    aiPlayer = room.getPlayer(player),
                    wasFull = room.full();

                room.removePlayer(aiPlayer);
                ai.remove(aiPlayer);

                if (wasFull) {

                    client.emitToLobby("addRoom", room.getGame());
                }
            });

            socket.on("newRoom", (game) => {

                const
                    client = clients.bySocket(socket),
                    roomExists = rooms.get(game);

                let room;

                if (roomExists) {

                    client.emit("roomAlreadyExists", game);

                } else {

                    room = rooms.add(game);
                    client.joinRoom(room);
                    client.emit("joinedGame", game);
                    client.emitToLobby("addRoom", game);
                }
            });

            socket.on ("exit", (bootedFromGame) => {

                const
                    action = bootedFromGame ? "userRemoved" : "userLeft",
                    client = clients.bySocket(socket),
                    room = client.room(),
                    player = client.player();

                client.broadcast(action, player);

                if (room.wasSaved()) {

                    client.broadcast("userLeftRoom", {room, player});
                }

                if (room.isFull()) {

                    client.emitToLobby("addRoom", room);
                    socket.leave(room.name());
                }

                room.removePlayer(player);

                if (room.isEmpty()) {

                    rooms.remove(room);

                    client.emitToLobby('removeRoom', this);

                    ai.remove(room.aiPlayers());
                }
            });

            socket.on("disconnect", () => {

                const
                    client = clients.bySocket(socket),
                    room = client.room();

                clients.disconnect(client.id());

                if (room.isEmpty()) {

                    rooms.remove(room, room.saved);

                    ai.remove(room.aiPlayers());
                }
            });
        }
    };
}

module.exports = sockets;