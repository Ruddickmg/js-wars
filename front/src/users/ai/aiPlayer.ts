import {Game} from "../../game/game";
import {Composer, default as composer} from "../../tools/composer";
import {Player} from "../players/player";

export interface AiPlayer extends Player  {

    emit(io: any, roomName: string, action: string, value: any): void;
    play(game: Game): void;
    [index: string]: any;
}

export default function(player: Player): AiPlayer {

    const compose: Composer<AiPlayer> = composer() as Composer<AiPlayer>;
    const aiProperties = {

        emit: (io: any, roomName: string, action: string, value: any): void => io.in(roomName).emit(action, value),
        isComputer: true,
        mode: "cp",
        play: (game: Game): void => console.log(`playing game called: ${game.name}`),
        ready: true,
    };

    return compose.excluding(["isComputer"], aiProperties, player, {yes: "cusha"});
}
