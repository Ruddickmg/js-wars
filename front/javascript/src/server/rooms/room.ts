import {Game} from "../../game/game";
import {AiPlayer} from "../../game/users/ai/aiPlayer";
import {Player} from "../../game/users/players/player";
import {AnyPlayer, isAiPlayer} from "../../game/users/players/playerSocketListener";
import {isDefined, isFunction} from "../../tools/validation/typeChecker";

export type RoomId = number | string;

export interface Room {
  addAi(aiPlayer: AiPlayer): AiPlayer;
  addPlayer(player: Player): Room;
  category(): string;
  getAiPlayers(): AiPlayer[];
  getGame(): Game;
  getPlayer(id: RoomId): AnyPlayer;
  getPlayers(): AnyPlayer[];
  getUsers(): Player[];
  hasStarted(): boolean;
  id(): RoomId;
  isEmpty(): boolean;
  isFull(): boolean;
  isSameAs(room: Room): boolean;
  isSaved(): boolean;
  name(): string;
  removePlayer(id: RoomId): AnyPlayer;
  replacePlayer(id: RoomId, replacement: AnyPlayer): AnyPlayer;
  size(): number;
}

export function isRoom(room: any): room is Room {
  return isDefined(room)
    && isFunction(room.addAi)
    && isFunction(room.category)
    && isFunction(room.getAiPlayers)
    && isFunction(room.getGame)
    && isFunction(room.getPlayers)
    && isFunction(room.getUsers)
    && isFunction(room.hasStarted)
    && isFunction(room.id)
    && isFunction(room.isEmpty)
    && isFunction(room.isFull)
    && isFunction(room.isSaved)
    && isFunction(room.name)
    && isFunction(room.removePlayer)
    && isFunction(room.replacePlayer)
    && isFunction(room.size);
}

export default function(roomId: RoomId, game: Game): Room {
  const categoryOfGame: string = game.category;
  const players: AnyPlayer[] = game.players;
  const invalidIndex = -1;
  const addAi = (aiPlayer: AiPlayer): AiPlayer => {
    const index: number = indexOf(aiPlayer.id);
    players.splice(index, 0, aiPlayer);
    return aiPlayer;
  };
  const addPlayer = function(player: Player): Room {
    players.push(player);
    return this;
  };
  const category = (): string => categoryOfGame;
  const getAiPlayers = (): AiPlayer[] => {
    return players.reduce((aiPlayers: AiPlayer[], player: AnyPlayer): AiPlayer[] => {
      if (isAiPlayer(player)) {
        aiPlayers.push(player);
      }
      return aiPlayers;
    }, []);
  };
  const getGame = (): Game => game;
  const getPlayer = (idOfRoom: RoomId): AnyPlayer => players[indexOf(idOfRoom)];
  const getPlayers = (): Player[] => players.slice();
  const getUsers = (): Player[] => {
    return players.reduce((allUsers: Player[], player: Player): Player[] => {
      if (!player.isComputer) {
        allUsers.push(player);
      }
      return allUsers;
    }, []);
  };
  const hasStarted = (): boolean => game.started;
  const id = (): RoomId => roomId;
  const indexOf = (playerId: RoomId): number => players.reduce((desiredIndex, player, index) => {
    const foundMatchingId: boolean = player.id === playerId;
    const indexHasNotBeenChanged: boolean = desiredIndex <= invalidIndex;
    return foundMatchingId && indexHasNotBeenChanged ? index : desiredIndex;
  }, invalidIndex);
  const isEmpty = (): boolean => !getUsers().length;
  const isFull = (): boolean => players.length >= game.max;
  const isSameAs = (room: Room): boolean => {
    const comparison = room.getGame();
    return ["id", "name", "created"].reduce((isTheSame: boolean, property: string) => {
      return game[property] === comparison[property] && isTheSame;
    }, true);
  };
  const isSaved = (): boolean => game.saved;
  const name = (): string => game.name;
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
  const size = (): number => players.length;
  return {
    addAi,
    addPlayer,
    category,
    getAiPlayers,
    getGame,
    getPlayer,
    getPlayers,
    getUsers,
    hasStarted,
    id,
    isEmpty,
    isFull,
    isSameAs,
    isSaved,
    name,
    removePlayer,
    replacePlayer,
    size,
  };
}
