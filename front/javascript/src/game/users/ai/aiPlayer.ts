import composer, {Composer} from "../../../tools/object/composer";
import {Game} from "../../game";
import {Player} from "../players/player";

export interface AiPlayer extends Player {
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
    play: (game: Game): any => `playing game called: ${game.name}`,
    ready: true,
  };
  return compose.excluding(["isComputer"], aiProperties, player);
}
