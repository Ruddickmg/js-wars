import {Game} from "../../game/game";
import {AiPlayer} from "../../game/users/ai/aiPlayer";
import {Player} from "../../game/users/players/player";
import {AnyPlayer, isAiPlayer} from "../../game/users/players/playerSocketListener";

export type RoomId = number | string;

export interface Room {

  id(): RoomId;
  getGame(): Game;
  name(): string;
  hasStarted(): boolean;
  isSaved(): boolean;
  category(): string;
  isEmpty(): boolean;
  isFull(): boolean;
  size(): number;
  getPlayers(): AnyPlayer[];
  getUsers(): Player[];
  getPlayer(id: RoomId): AnyPlayer;
  addAi(aiPlayer: AiPlayer): AiPlayer;
  isSameAs(room: Room): boolean;
  addPlayer(player: Player): Room;
  getAiPlayers(): AiPlayer[];
  removePlayer(id: RoomId): AnyPlayer;
  replacePlayer(id: RoomId, replacement: AnyPlayer): AnyPlayer;
}

export default function(roomId: RoomId, game: Game): Room {

  const categoryOfGame: string = game.category;
  const players: AnyPlayer[] = game.players;
  const invalidIndex = -1;

  const indexOf = (id: RoomId): number => players.reduce((desiredIndex, player, index) => {

    const foundMatchingId: boolean = player.id === id;
    const indexHasNotBeenChanged: boolean = desiredIndex <= invalidIndex;

    return foundMatchingId && indexHasNotBeenChanged ? index : desiredIndex;

  }, invalidIndex);

  const addPlayer = function(player: Player): Room {

    players.push(player);

    return this;
  };

  const removePlayer = (userId: RoomId): AnyPlayer => {

    const index: number = indexOf(userId);

    if (!isNaN(index)) {

      return players.splice(index, 1)[0];
    }
  };

  const replacePlayer = (userId: RoomId, replacement: AnyPlayer): AnyPlayer => {

    const index: number = indexOf(userId);

    if (!isNaN(index)) {

      return players.splice(index, 1, replacement)[0];
    }
  };

  const addAi = (aiPlayer: AiPlayer): AiPlayer => {

    const index: number = indexOf(aiPlayer.id);

    players.splice(index, 0, aiPlayer);

    return aiPlayer;
  };

  const getPlayers = (): Player[] => players.slice();
  const getAiPlayers = (): AiPlayer[] => {

    return players.reduce((aiPlayers: AiPlayer[], player: AnyPlayer): AiPlayer[] => {

      if (isAiPlayer(player)) {

        aiPlayers.push(player);
      }

      return aiPlayers;

    }, []);
  };
  const getUsers = (): Player[] => {

    return players.reduce((allUsers: Player[], player: Player): Player[] => {

      if (!player.isComputer) {

        allUsers.push(player);
      }

      return allUsers;

    }, []);
  };
  const getPlayer = (id: RoomId): AnyPlayer => players[indexOf(id)];
  const getGame = (): Game => game;
  const isSaved = (): boolean => game.saved;
  const isEmpty = (): boolean => !getUsers().length;
  const isFull = (): boolean => players.length >= game.max;
  const hasStarted = (): boolean => game.started;
  const isSameAs = (room: Room): boolean => {

    const comparison = room.getGame();

    return ["id", "name", "created"].reduce((isTheSame: boolean, property: string) => {

      return game[property] === comparison[property] && isTheSame;

    }, true);
  };
  const category = (): string => categoryOfGame;
  const id = (): RoomId => roomId;
  const name = (): string => game.name;
  const size = (): number => players.length;

  return {

    addPlayer,
    addAi,
    getPlayers,
    category,
    getAiPlayers,
    getGame,
    getPlayer,
    isSaved,
    isEmpty,
    isFull,
    hasStarted,
    isSameAs,
    id,
    name,
    size,
    getUsers,
    removePlayer,
    replacePlayer,
  };
}
