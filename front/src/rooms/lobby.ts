import {Player} from "../users/players/player";
import {RoomId} from "./room";

export interface Lobby {

    id(): RoomId;
    name(): string;
    size(): number;
    all(): object;
    getPlayer(id: RoomId): Player;
    add(player: Player): Lobby;
    removePlayer(id: RoomId): Player;
}

export default function(identity: RoomId): Lobby {

    const roomId: RoomId = identity;
    const nameOfRoom: string = "lobby";
    const players: any = {};

    let length: number = 0;

    const add = function(player: Player): Lobby {

        const playerId: RoomId = player.id;

        length += 1;
        player.number = length;
        players[playerId] = player;

        return this;
    };
    const all = (): object => players;
    const size = (): number => length;
    const getPlayer = (playerId: RoomId): Player => players[playerId];
    const id = (): RoomId => roomId;
    const name = (): string => nameOfRoom;
    const removePlayer = (playerId: RoomId): Player => {

        const removed: Player = players[playerId];

        delete players[playerId];

        if (removed) {

            length -= 1;
        }

        return removed;
    };

    return {

        add,
        all,
        size,
        getPlayer,
        id,
        name,
    };
}
