import {default as identifier, Identifier} from "../../tools/identity.js";
import {User, UserId} from "../user";
import {AiPlayer, default as createAiPlayer} from "./aiPlayer";

interface AiPlayers {

    [index: string]: AiPlayer;
}

export interface AiController {

    get(id: UserId): AiPlayer;
    remove(...aiPlayers: AiPlayer[]): AiController;
    add(aiPlayer: User, roomName: string): AiPlayer;
}

export default function() {

    let players: AiPlayers = {};

    const incrementId = (id: number): number => id + 1;
    const decrementId = (id: number): number => id - 1;
    const identity: Identifier<UserId> = identifier<UserId>(1, incrementId, decrementId);
    const addPlayer = (player: AiPlayer, currentPlayers: AiPlayers): AiPlayers => {

        const modifiedPlayers: AiPlayers = Object.assign({}, currentPlayers);
        const id: UserId = identity.get();

        modifiedPlayers[id] = player;

        return modifiedPlayers;
    };
    const removePlayer = (id: UserId, currentPlayers: AiPlayers): AiPlayers => {

        const modifiedPlayers: AiPlayers = Object.assign({}, currentPlayers);

        identity.remove(id);

        delete modifiedPlayers[id];

        return modifiedPlayers;
    };
    const get = (id: UserId): AiPlayer => players[id];
    const remove = (...aiPlayers: AiPlayer[]): AiController => {

        aiPlayers.forEach((aiPlayer) => {

            players = removePlayer(aiPlayer.id, players);
        });

        return this;
    };
    const add = (aiPlayer: User, roomName: string): AiPlayer => {

        const id: UserId = identity.get();

        players = addPlayer(createAiPlayer(aiPlayer, roomName), players);

        return players[id];
    };

    return {
        addElement,
        get,
        remove,
    };
}
