import {Player} from "../../game/users/players/player";
import {isDefined, isFunction} from "../../tools/validation/typeChecker";
import {RoomId} from "./room";

export interface Lobby {
  id(): RoomId;
  name(): string;
  size(): number;
  getPlayers(): Player[];
  getPlayer(id: RoomId): Player;
  addPlayer(player: Player): Lobby;
  removePlayer(id: RoomId): Player;
}

export default function(identity: RoomId): Lobby {
  let length: number = 0;
  const roomId: RoomId = identity;
  const nameOfRoom: string = "lobby";
  const players: any = {};
  const addPlayer = function(player: Player): Lobby {
    const playerId: RoomId = player.id;
    length += 1;
    player.getPlayerByNumber = length;
    players[playerId] = player;
    return this;
  };
  const getPlayers = (): Player[] => Object.keys(players).map((key: string) => players[key]);
  const size = (): number => length;
  const getPlayer = (playerId: RoomId): Player => players[playerId];
  const id = (): RoomId => roomId;
  const name = (): string => nameOfRoom;
  const removePlayer = (playerId: RoomId): Player => {
    const removed: Player = players[playerId];
    delete players[playerId];
    if (removed) {
      length -= 1;
    }
    return removed;
  };
  return {
    addPlayer,
    getPlayer,
    getPlayers,
    id,
    name,
    removePlayer,
    size,
  };
}

export function isLobby(element: any) {
  const nameOfLobby: string = "lobby";
  return isDefined(element)
    && isFunction(element.addPlayer)
    && isFunction(element.getPlayer)
    && isFunction(element.getPlayers)
    && isFunction(element.size)
    && isFunction(element.id)
    && isFunction(element.removePlayer)
    && isFunction(element.name)
    && element.name() === nameOfLobby;
}
