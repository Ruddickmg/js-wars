import createGame, {Game, isGame} from "./game";
import {Map} from "./map/map";

export const setupGame = ({name, map, id}: Game): Game => {
  // const user = app.user.raw();
  const {category}: Map = map;
  // players.push(user); // TODO figure this out
  // app.game.setSettings(received.settings);
  // app.game.setJoined(true);
  return createGame(name, category, map, id);
};

export const setupJoinedGame = (game: Game): Game => {
  // transmit.join(game);
  return setupGame(game);
};

export const setup = function(received: Map | Game) {
  const map: Map = isGame(received) ? (received as Game).map : received as Map;
  if (isGame(received)) {
    setupGame(received);
  }
  this.removePlayer();
  return received;
};
