import {default as identifier, Identifier} from "../../tools/identity.js";
import {User, RoomId} from "../user";
import {AiPlayer, default as createAiPlayer} from "./aiPlayer";

interface AiPlayers {

    [index: string]: AiPlayer;
}

export interface AiController {

    get(id: RoomId): AiPlayer;
    remove(...aiPlayers: AiPlayer[]): AiController;
    add(aiPlayer: User, roomName: string): AiPlayer;
}

export default function() {

    let players: AiPlayers = {};

    const incrementId = (id: number): number => id + 1;
    const decrementId = (id: number): number => id - 1;
    const identity: Identifier<RoomId> = identifier<RoomId>(1, incrementId, decrementId);
    const addPlayer = (player: AiPlayer, currentPlayers: AiPlayers): AiPlayers => {

        const modifiedPlayers: AiPlayers = Object.assign({}, currentPlayers);
        const id: RoomId = identity.getPlayer();

        modifiedPlayers[id] = player;

        return modifiedPlayers;
    };
    const removePlayer = (id: RoomId, currentPlayers: AiPlayers): AiPlayers => {

        const modifiedPlayers: AiPlayers = Object.assign({}, currentPlayers);

        identity.removePlayer(id);

        delete modifiedPlayers[id];

        return modifiedPlayers;
    };
    const get = (id: RoomId): AiPlayer => players[id];
    const remove = (...aiPlayers: AiPlayer[]): AiController => {

        aiPlayers.forEach((aiPlayer) => {

            players = removePlayer(aiPlayer.id, players);
        });

        return this;
    };
    const add = (aiPlayer: User, roomName: string): AiPlayer => {

        const id: RoomId = identity.getPlayer();

        players = addPlayer(createAiPlayer(aiPlayer, roomName), players);

        return players[id];
    };

    return {
        addPlayer,
        getPlayer,
        removePlayer,
    };
}
