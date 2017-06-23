import {Backend, default as connectToBackend} from "../connections/backend";
import {Game} from "../game/game";
import {default as identifier, Identifier} from "../tools/identity.js";
import {default as createLobby, Lobby} from "./lobby.js";
import {default as createRoom, Room, RoomId} from "./room.js";

export type AnyRoom = Room | Lobby;

export interface OpenRooms {

    [index: string]: Game[];
}

interface ListOfRooms {

    [index: string]: Room;
}

interface Categories {

    [index: string]: ListOfRooms | Lobby;
}

export interface Rooms {

    get(id: RoomId): Room;
    addReservedIds(ids: RoomId[]): Rooms;
    lobby(): Lobby;
    category(category: string): ListOfRooms;
    add(game: Game): Room;
    remove(room: Room): Room;
    getOpenRooms(category: string): Game[];
    getRunningRooms(category: string): Game[];
    matchRunningGames(games: Game[]): Game[];
}

export function isRoom(room: AnyRoom): room is Room {

    return (room as Room).getGame !== undefined;
}

export default function(url: string): Rooms {

    const backend: Backend = connectToBackend(url);
    const restrictedRoomNames: string[] = ["lobby"];
    const restricted: any = restrictedRoomNames.reduce((roomNames: any, name: string): object => {

        roomNames[name] = true;

        return roomNames;

    }, {});
    const all: ListOfRooms = {};
    const incrementId = (id: number): number => id + 1;
    const decrementId = (id: number): number => id - 1;
    const identity: Identifier<RoomId> = identifier<RoomId>(0, incrementId, decrementId);
    const canEdit = (name: string): boolean => !restricted[name];
    const canAdd = (name: string, id: RoomId): boolean => canEdit(name) && !get(id);
    const categories: Categories = {lobby: createLobby(identity.get())};
    const category = (currentCategory: string): any => {

        if (!categories[currentCategory]) {

            categories[currentCategory] = {};
        }

        return categories[currentCategory];
    };
    const get = (id: RoomId): Room => all[id];
    const getAllOpenRooms = (roomCategory: string): OpenRooms => {

        const rooms: any = categories[roomCategory];
        const open: Game[] = [];
        const running: Game[] = [];

        return Object.keys(rooms).reduce((openRooms: OpenRooms, id: string): OpenRooms => {

            const room: Room = rooms[id];
            const type: string = room.hasStarted() ? "running" : "open";

            if (!room.isFull()) {

                openRooms[type].push(room.getGame());
            }

            return openRooms;

        }, {open, running});
    };

    const add = (game: Game): Room => {

        const id: RoomId = game.id || identity.get();
        const newRoom: Room = createRoom(id, game);
        const roomCategory: string = newRoom.category();

        if (canAdd(newRoom.name(), newRoom.id())) {

            // if (newRoom.isSaved()) {

            category(roomCategory)[id] = newRoom;

            all[id] = newRoom;
            // }

            // console.log(all);

            return newRoom;
        }
    };

    const addReservedIds = function(ids: RoomId[]): Rooms {

        identity.reserveIds(ids);

        return this;
    };

    const getOpenRooms = (roomCategory: string): Game[] => getAllOpenRooms(roomCategory).open;
    const getRunningRooms = (roomCategory: string): Game[] => getAllOpenRooms(roomCategory).running;
    const lobby = (): Lobby => categories.lobby as Lobby;
    const matchRunningGames = (games: Game[]): Game[] => {

        return games.map((savedGame: Game): Game => {

            const room: Room = get(savedGame.id);

            return room ? room.getGame() : savedGame;
        }); // .reverse();
    };

    const remove = (room: Room): Room => {

        const roomBeingRemoved: Room = room;
        const storedRoom: Room = get(roomBeingRemoved.id());
        const roomsInCategory: any = categories[storedRoom.category()];
        const roomId: RoomId = storedRoom.id();
        const userHasStatedTheyDoNotWishToSave: boolean = !room.isSaved() && storedRoom.isSaved();

        if (canEdit(roomBeingRemoved.name()) && storedRoom.isSameAs(roomBeingRemoved)) {

            if (roomsInCategory) {

                delete roomsInCategory[roomId];
            }

            delete all[roomId];

            if (userHasStatedTheyDoNotWishToSave) {

                identity.remove(roomId);
                backend.deleteGame(storedRoom.id())
                    .catch((error: Error) => { throw error; });
            }
        }

        return storedRoom;
    };

    return {

        add,
        addReservedIds,
        category,
        get,
        getOpenRooms,
        getRunningRooms,
        lobby,
        matchRunningGames,
        remove,
    };
}
