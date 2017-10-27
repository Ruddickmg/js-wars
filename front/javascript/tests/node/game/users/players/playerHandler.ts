import notifier, {PubSub} from "../../../tools/pubSub";
import createAiPlayer from "../ai/aiPlayer";
import {UserId} from "../user";
import {Player} from "./player";
import {AnyPlayer} from "./playerSocketListener";

export interface PlayerHandler {

  addPlayer(player: AnyPlayer): PlayerHandler;

  addPlayers(multiplePlayers: AnyPlayer[]): PlayerHandler;

  allPlayersAreReady(): boolean;

  defeatedPlayers(): AnyPlayer[];

  empty(): boolean;

  first(): AnyPlayer;

  getAllPlayers(): AnyPlayer[];

  getCurrentPlayer(): AnyPlayer;

  getOtherPlayers({id: userId}: AnyPlayer): AnyPlayer[];

  getPlayer(player: AnyPlayer): AnyPlayer;

  getPlayerById(id: UserId): AnyPlayer;

  getPlayerByNumber(playerNumber: number): AnyPlayer;

  last(): AnyPlayer;

  namesOfEachPlayerToString(allPlayers: AnyPlayer[]): string;

  next(): AnyPlayer;

  numberOfActivePlayers(): number;

  playerDefeated(player: AnyPlayer): AnyPlayer;

  removePlayer(player: AnyPlayer): AnyPlayer;

  replacePlayer(player: Player, replacement: AnyPlayer): AnyPlayer;

  setCurrentPlayer(player: Player): Player;

  updatePlayer(player: Player): Player;
}

export default function(players: Player[] = [], maximumAmountOfPlayers: number): PlayerHandler {

  let current: Player;
  let gameHasStarted: boolean;
  let indexOfLastPlayer: number = maximumAmountOfPlayers - 1;

  const notifications: PubSub = notifier();
  const finishedPlayers: Player[] = [];
  const numberOfPlayersRequiredForGame = 2;

  const getNext = (): Player => {

    const playerIndex: number = indexOfPlayer(current, players);

    return playerIndex >= indexOfLastPlayer ? first() : players[playerIndex + 1];
  };

  const shiftPlayers = (indexOfRemovedPlayer: number, currentPlayers: Player[]) => {

    currentPlayers.slice(indexOfRemovedPlayer).forEach((player: Player, index: number): void => {

      player.number = index + 1;
    });
  };

  const gameIsFull = () => numberOfActivePlayers() >= maximumAmountOfPlayers;
  const indexOfPlayer = (player: Player, currentPlayers: Player[]) => {

    const playerId = player.id;

    return currentPlayers.findIndex(({id}: Player) => playerId === id);
  };

  const addPlayer = function(player: AnyPlayer): PlayerHandler {

    const index: number = indexOfPlayer(player, players);

    if (!gameIsFull()) {

      if (isNaN(index)) {

        player.number = numberOfActivePlayers() + 1;
        players.push(player);

      } else {

        players[index] = Object.assign(player, players[index]);
      }

      notifications.publish("playerAdded", player);

      return this;
    }

    throw Error("Game is full.");
  };

  const addPlayers = (multiplePlayers: AnyPlayer[]): PlayerHandler => {

    const wasEmpty = empty();

    multiplePlayers.forEach((player: Player) => addPlayer(player));

    if (wasEmpty) {

      current = first();
    }

    return this;
  };

  const allPlayersAreReady = (): boolean => {

    return players.reduce((allAreReady: boolean, {ready}: Player) => ready && allAreReady, true);
  };

  const defeatedPlayers = (): AnyPlayer[] => finishedPlayers;
  const empty = (): boolean => !numberOfActivePlayers();
  const first = (): AnyPlayer => players[0];
  const getAllPlayers = (): AnyPlayer[] => players.concat(finishedPlayers);
  const getCurrentPlayer = (): AnyPlayer => current || first();
  const getOtherPlayers = ({id: userId}: AnyPlayer): AnyPlayer[] => {

    return players.filter(({id}: Player): boolean => id !== userId);
  };
  const getPlayer = (player: AnyPlayer): AnyPlayer => getPlayerById(player.id);
  const getPlayerById = (id: UserId): AnyPlayer => {

    return getAllPlayers().find(({id: userId}: AnyPlayer) => userId === id);
  };
  const getPlayerByNumber = (playerNumber: number): AnyPlayer => {

    return players.find((player: AnyPlayer) => player.number === playerNumber);
  };
  const last = (): AnyPlayer => players[indexOfLastPlayer];
  const namesOfEachPlayerToString = (allPlayers: AnyPlayer[]): string => {

    const amountOfPlayers: number = allPlayers.length;

    return allPlayers.reduce((stringOfPlayerNames: string, {name}: Player, index: number): string => {

      let transition: string = "";

      const isNotLastPlayer = index + 1 < amountOfPlayers;
      const isBeforeLastPlayer = index + 2 < amountOfPlayers;

      if (isNotLastPlayer) {

        transition = isBeforeLastPlayer ? ", " : " and ";
      }

      return `${stringOfPlayerNames}${name}${transition}`;

    }, "");
  };
  const next = (): AnyPlayer => {

    current = getNext();

    return current;
  };
  const numberOfActivePlayers = (): number => players.length;
  const playerDefeated = (player: AnyPlayer): AnyPlayer => {

    const indexOfDefeatedPlayer: number = indexOfPlayer(player, players);

    let removedPlayer: AnyPlayer;

    if (isNaN(indexOfDefeatedPlayer)) {

      throw Error(`Argument passed to playerDefeated(${player}) was not found in the array of active players.`);
    }

    removedPlayer = players.splice(indexOfDefeatedPlayer, 1)[0];

    finishedPlayers.push(removedPlayer);

    if (numberOfActivePlayers() < numberOfPlayersRequiredForGame) {

      finishedPlayers.push(players.pop());

      notifications.publish("gameOver", {players: finishedPlayers});
      // TODO -- make this report that the game needs to end
      // return app.game.end();
    }

    indexOfLastPlayer -= 1;

    return removedPlayer;
  };
  const removePlayer = (player: AnyPlayer): AnyPlayer => {

    let removedPlayer: AnyPlayer;

    const indexOfRemovedPlayer = indexOfPlayer(player, players);

    if (gameHasStarted && !player.isComputer) {

      removedPlayer = replacePlayer(player, createAiPlayer(player));

    } else if (!isNaN(indexOfRemovedPlayer)) {

      removedPlayer = players.splice(indexOfRemovedPlayer, 1)[0];

      notifications.publish("playerRemovedFromGame", removedPlayer);
      // transmit.removeAi(removedPlayer);

      if (numberOfActivePlayers() >= indexOfRemovedPlayer + 1) {

        shiftPlayers(indexOfRemovedPlayer, players);
      }

      indexOfLastPlayer -= 1;
    }

    return removedPlayer;
  };
  const replacePlayer = (player: Player, replacement: AnyPlayer): AnyPlayer => {

    const index = indexOfPlayer(player, players);
    const replacedPlayer = players[index];

    if (isNaN(index)) {

      throw Error("Not able to replace player, player not found.");
    }

    // transmit.boot(players[index]);

    notifications.publish("playerReplaced", {player, replacement});

    players[index] = replacement;

    return replacedPlayer;
  };
  const setCurrentPlayer = (player: AnyPlayer): AnyPlayer => {

    if (current) {

      current.isTurn = false;
    }

    player.isTurn = true;

    current = player;

    return current;
  };
  const updatePlayer = (player: AnyPlayer): AnyPlayer => {

    const index: number = indexOfPlayer(player, players);

    if (!isNaN(index)) {

      players[index] = player;
    }

    return player;
  };

  notifications.subscribe("gameHasStarted", () => {

    gameHasStarted = true;
  });

  return {

    addPlayer,
    addPlayers,
    allPlayersAreReady,
    defeatedPlayers,
    empty,
    first,
    getAllPlayers,
    getCurrentPlayer,
    getOtherPlayers,
    getPlayer,
    getPlayerById,
    getPlayerByNumber,
    last,
    namesOfEachPlayerToString,
    next,
    numberOfActivePlayers,
    playerDefeated,
    removePlayer,
    replacePlayer,
    setCurrentPlayer,
    updatePlayer,

    // TODO - move somewhere else
    // unconfirm: function() {
    //
    //     players = players.map(function(player) {
    //
    //         return playerController.unconfirm(player);
    //     });
    // },
  };
}
