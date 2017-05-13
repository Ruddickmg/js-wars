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
    category(category: string): object;
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
    const getOrCreateCategory = (category: string): any => {

        if (!categories[category]) {

            categories[category] = {};
        }

        return categories[category];
    };
    const get = (id: RoomId): Room => all[id];
    const getOpenRooms = (category: string): OpenRooms => {

        const rooms: any = categories[category];

        return Object.keys(rooms).reduce((openRooms: OpenRooms, id: string): OpenRooms => {

            const room: Room = rooms[id];
            const type: string = room.hasStarted() ? "running" : "open";

            if (!room.isFull()) {

                openRooms[type].push(room.getGame());
            }

            return openRooms;

        }, {open: [], running: []});
    };

    return {

        add(game: Game): Room {

            const id: RoomId = game.id || identity.get();
            const newRoom: Room = createRoom(id, game);
            const category: string = newRoom.category();

            if (canAdd(newRoom.name(), newRoom.id())) {

                if (newRoom.hasBeenSaved()) {

                    getOrCreateCategory(category)[id] = newRoom;
                }

                return newRoom;
            }
        },
        addReservedIds(ids: RoomId[]): Rooms {

            identity.reserveIds(ids);

            return this;
        },
        category: getOrCreateCategory,
        get,
        getOpenRooms: (category: string): Game[] => getOpenRooms(category).open,
        getRunningRooms: (category: string): Game[] => getOpenRooms(category).running,
        lobby: (): Lobby => categories.lobby as Lobby,
        matchRunningGames(games: Game[]): Game[] {

            const gameList: Game[] = [];

            games.forEach((game: Game): void => {

                const storedGame: Game = get(game.id).getGame();

                gameList.push(storedGame || game);
            });

            return gameList.reverse();
        },
        remove(room: Room): Room {

            const roomBeingRemoved: Room = room;
            const storedRoom: Room = get(roomBeingRemoved.id());
            const category: any = categories[storedRoom.category()];
            const roomId: RoomId = storedRoom.id();
            const userHasStatedTheyDoNotWishToSave: boolean = !room.hasBeenSaved() && storedRoom.hasBeenSaved();

            if (canEdit(roomBeingRemoved.name()) && storedRoom.isSameAs(roomBeingRemoved)) {

                if (category) {

                    delete category[roomId];
                }

                delete all[roomId];

                if (userHasStatedTheyDoNotWishToSave) {

                    identity.remove(roomId);
                    backend.deleteGame(storedRoom.id())
                        .catch((error: Error) => console.log(error));
                }
            }

            return storedRoom;
        },
    };
}
