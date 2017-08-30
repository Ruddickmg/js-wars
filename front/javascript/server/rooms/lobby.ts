import {Player} from "../../game/users/players/player";
import {RoomId} from "./room";

export interface Lobby {

    id(): RoomId;
    name(): string;
    size(): number;
    getPlayers(): object;
    getPlayer(id: RoomId): Player;
    addPlayer(player: Player): Lobby;
    removePlayer(id: RoomId): Player;
}

export default function(identity: RoomId): Lobby {

    let length: number = 0;

    const roomId: RoomId = identity;
    const nameOfRoom: string = "lobby";
    const players: any = {};
    const addPlayer = function(player: Player): Lobby {

        const playerId: RoomId = player.id;

        length += 1;
        player.getPlayerByNumber = length;
        players[playerId] = player;

        return this;
    };
    const getPlayers = (): object => players;
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

        addPlayer,
        getPlayers,
        size,
        getPlayer,
        id,
        name,
        removePlayer,
    };
}
