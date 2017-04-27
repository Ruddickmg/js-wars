"use strict";

const
    createRoom = require("./room.js"),
    createLobby = require("./lobby.js"),
    identifier = require("../tools/identity.js");

function rooms() {

    const
        restrictedRoomNames = ["lobby"],
        restricted = restrictedRoomNames.reduce((roomNames, name) => {

            roomNames[name] = true;

            return roomNames;

        }, {}),
        all = {},
        get = (id) => all[id],
        identity = identifier(),
        canEdit = (name) => !restricted[name],
        canAdd = (name, id) => canEdit(name) && !get(id),
        categories = {lobby: createLobby(identity.get(), "lobby")};

    return {

        get: get,
        addReservedIds: (ids) => identity.reserveIds(ids),
        lobby: () => categories.lobby,
        category(category) {

            if (!categories[category]) {

                categories[category] = {};
            }

            return categories[category];
        },
        add(room) {

            const
                id = room.id || identity.get(),
                newRoom = createRoom(id, room);

            if (canAdd(newRoom.name(), newRoom.id())) {

                return room.wasSaved ? room : (this.getCategory(room.category)[id] = room);
            }
        },
        remove(room) {

            const
                roomBeingRemoved = room,
                storedRoom = get(roomBeingRemoved),
                category = categories[storedRoom.category()],
                id = storedRoom.id();

            if (canEdit(roomBeingRemoved) && storedRoom.isSameAs(roomBeingRemoved)) {

                if (category) {

                    delete category[id];
                }

                delete all[id];

                if (!roomBeingRemoved.wasSaved()) {

                    identity.remove(id);

                    if (storedRoom.wasSaved()) {

                        storedRoom.delete();
                    }
                }
            }

            return storedRoom;
        },
        open(category) {

            const rooms = categories[category];

            Object.keys(rooms).reduce((openRooms, id) => {

                const
                    room = rooms[id],
                    type = room.hasStarted() ? "running" : "open";

                if (!room.isFull()) {

                    openRooms[type].push(room.getGame());
                }

                return openRooms;

            }, {open:[], running:[]});
        }
    };
}

module.exports = rooms;