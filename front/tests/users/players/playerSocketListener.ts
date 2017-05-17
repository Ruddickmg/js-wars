import {Game} from "../../game/game";
import {Unit} from "../../game/map/elements/unit/unit";
import {AiPlayer} from "../ai/aiPlayer";
import {Player} from "./player";

export type AnyPlayer = Player | AiPlayer;

export function isAiPlayer(player: AnyPlayer): player is AiPlayer {

    return (player as AiPlayer).emit !== undefined;
}

export default function() {

    const broadcast = (playerSocket: any, action: string, value: any): void => {

        playerSocket.broadcast.moveTo(playerSocket.room.name).emit(action, value);
    };
    const addUnit = (unit: Unit, socket: any): void => broadcast(socket, "addUnit", unit);
    const attack = (attacking: any, socket: any): void => broadcast(socket, "attack", attacking);
    const capture = (capturing: any, socket: any): void => broadcast(socket, "capture", capturing);
    const confirm = (response: any, socket: any): void => broadcast(socket, "confirmationResponse", {
        answer: response.answer,
        sender: this,
    });
    const defeat = (battle: any, socket: any): void => broadcast(socket, "defeat", battle);
    const del = (unit: Unit, socket: any): void => broadcast(socket, "delete", unit);
    const endTurn = (end: any, socket: any): void =>  broadcast(socket, "endTurn", end);
    const join = (joinedUnits: any, socket: any): void => broadcast(socket, "joinUnits", joinedUnits);
    const load = (loading: any, socket: any): void => broadcast(socket, "loadUnit", loading);
    const moveCursor = (moved: any, socket: any): void => broadcast(socket, "cursorMove", moved);
    const moveUnit = (move: any, socket: any): void => broadcast(socket, "moveUnit", move);
    const save = (game: Game, socket: any): void => broadcast(socket, "confirmSave", game);
    const unload = (transport: any, socket: any): void => broadcast(socket, "unload", transport);

    return {
        addUnit,
        attack,
        capture,
        confirm,
        defeat,
        del,
        endTurn,
        join,
        load,
        moveCursor,
        moveUnit,
        save,
        unload,
    };
}
