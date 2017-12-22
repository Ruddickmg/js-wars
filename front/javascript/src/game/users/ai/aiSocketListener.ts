import {Client} from "../../../server/clients/client";
import {ClientHandler} from "../../../server/clients/clients";
import {Listener} from "../../../server/connections/sockets/listener";
import {isRoom, Room} from "../../../server/rooms/room";
import {publish} from "../../../tools/pubSub";
import {AnyPlayer, isAiPlayer} from "../players/playerSocketListener";
import {AiController} from "./aiController";
import {AiPlayer} from "./aiPlayer";

export default function(clients: ClientHandler, aiHandler: AiController): Listener {
  const aiTurn = ({aiPlayer, game}: AiPlayer): void => aiHandler.get(aiPlayer.id).play(game);
  const addAiPlayer = (player: any, socket: any): void => {
    const client: Client = clients.bySocket(socket);
    const room: Room = client.getRoom() as Room;
    const aiPlayer: AiPlayer = aiHandler.add(player, room.name());
    if (isRoom(room)) {
      room.addAi(aiPlayer);
      client.broadcast("aiPlayerAdded", aiPlayer);
      if (room.isFull()) {
        client.emitToLobby("removeRoom", room);
      }
    }
  };
  const removeAiPlayer = (player: any, socket: any): void => {
    const client: Client = clients.bySocket(socket);
    const room: Room = client.getRoom() as Room;
    const id = player.id;
    const aiPlayer: AnyPlayer = room.getPlayer(id);
    let wasFull: boolean;
    if (isRoom(room)) {
      room.removePlayer(id);
      wasFull = room.isFull();
      if (isAiPlayer(aiPlayer)) {
        aiHandler.remove(aiPlayer);
      } else {
        publish("error", "Attempt at removing Ai Player from Game failed, non ai players detected");
      }
      if (wasFull) {
        client.emitToLobby("addRoom", room.getGame());
      }
    }
  };
  return {
    addAiPlayer,
    aiTurn,
    removeAiPlayer,
  };
}
