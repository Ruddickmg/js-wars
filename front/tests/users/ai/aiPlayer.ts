import {Game} from "../../game/game";
import {Composer, default as composer} from "../../tools/composer.spec";
import {CO} from "../co/co";
import {default as createPlayer, Player} from "../players/player";
import {User} from "../user";

export interface AiPlayer extends Player  {

    emit(io: any, roomName: string, action: string, value: any): void;
    play(game: Game): void;
}

export default function(user: User, co: CO): AiPlayer {

    const compose: Composer<AiPlayer> = composer<AiPlayer>();
    const player = createPlayer(user, co);
    const aiProperties = {

        emit: (io: any, roomName: string, action: string, value: any): void => io.in(roomName).emit(action, value),
        isComputer: true,
        mode: "cp",
        play: (game: Game): void => console.log(`playing game called: ${game.name}`),
        ready: true,
    };

    return compose.excluding(["isComputer"], aiProperties, player, {yes: "cusha"});
}
