const setupGame = ({name, map, players, id}: Game): Game => {

  const user = app.user.raw();
  const {category}: Map = map;

  players.push(user); // TODO figure this out

  // app.game.setSettings(received.settings);
  // app.game.setJoined(true);

  return createGame(name, category, map, id);
};
const setupJoinedGame = (game: Game): Game => {

  transmit.join(game);

  return setupGame(game);
};
const setup = function(received: Map | Game) {

  const map: Map = isGame(received) ? received.map : received;

  if (isGame(received)) {

    setupGame(received);
  }

  this.removePlayer();

  return received;
};