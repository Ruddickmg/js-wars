import {Player} from "../users/players/player";
import {UserId} from "../users/user";

export interface Lobby {

    id(): UserId;
    name(): string;
    size(): number;
    all(): object;
    getPlayer(id: UserId): Player;
    add(player: Player): Lobby;
    removePlayer(id: UserId): Player;
}

export default function(identity: UserId): Lobby {

    const id: UserId = identity;
    const name: string = "lobby";
    const players: any = {};

    let length: number = 0;

    return {

        add(player: Player): Lobby {

            const playerId: UserId = player.id;

            length += 1;
            player.number = length;
            players[playerId] = player;

            return this;
        },
        all: (): object => players,
        getPlayer: (playerId: UserId): Player => players[playerId],
        id: (): UserId => id,
        name: (): string => name,
        removePlayer(playerId: UserId): Player {

            const removed: Player = players[playerId];

            delete players[playerId];

            if (removed) {

                length -= 1;
            }

            return removed;
        },
        size: (): number => length,
    };
}
