import {Room} from "../../../server/rooms/room";
import getRoomHandler, {Rooms} from "../../../server/rooms/rooms";
import identifier, {Identifier} from "../../../tools/identity";
import single from "../../../tools/storage/singleton";
import {UserId} from "../user";
import {AiPlayer} from "./aiPlayer";

interface AiPlayers {

  [index: string]: AiPlayer;
}

export interface AiController {

  get(id: UserId): AiPlayer;
  remove(...aiPlayers: AiPlayer[]): AiController;
  add(player: AiPlayer, roomName: string): AiPlayer;
}

export default single<AiController>(function() {

  let players: AiPlayers = {};

  const rooms: Rooms = getRoomHandler();
  const incrementId = (id: number): number => id + 1;
  const decrementId = (id: number): number => id - 1;
  const identity: Identifier<UserId> = identifier<UserId>(1, incrementId, decrementId);
  const addPlayer = (player: AiPlayer, currentPlayers: AiPlayers): AiPlayers => {

    const modifiedPlayers: AiPlayers = Object.assign({}, currentPlayers);
    const id: UserId = identity.get();

    modifiedPlayers[id] = player;

    return modifiedPlayers;
  };
  const removePlayer = (id: UserId, currentPlayers: AiPlayers): AiPlayers => {

    const modifiedPlayers: AiPlayers = Object.assign({}, currentPlayers);

    identity.remove(id);

    delete modifiedPlayers[id];

    return modifiedPlayers;
  };
  const get = (id: UserId): AiPlayer => players[id];
  const remove = (...aiPlayers: AiPlayer[]): AiController => {

    aiPlayers.forEach((aiPlayer) => {

      players = removePlayer(aiPlayer.id, players);
    });

    return this;
  };
  const add = (player: AiPlayer, roomName: string): AiPlayer => {

    const room: Room = rooms.get(roomName); // TODO make sure this works
    const id = identity.get();

    player.id = id;
    players = addPlayer(player, players);
    room.addPlayer(player);

    return players[id];
  };

  return {
    add,
    get,
    remove,
  };
});
