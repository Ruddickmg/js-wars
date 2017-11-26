import {Client} from "../../../server/clients/client";
import {ClientHandler} from "../../../server/clients/clients";
import {Listener} from "../../../server/connections/sockets/listener";
import {AnyRoom, isRoom} from "../../../server/rooms/rooms";
import {AnyPlayer, isAiPlayer} from "../players/playerSocketListener";
import {AiController} from "./aiController";
import {AiPlayer} from "./aiPlayer";

export default function(clients: ClientHandler, aiHandler: AiController): Listener {

  const aiTurn = (_: Error, {aiPlayer, game}: AiPlayer): void => aiHandler.get(aiPlayer.id).play(game);
  const addAiPlayer = (_: Error, player: any, socket: any): void => {

    const client: Client = clients.bySocket(socket);
    const room: AnyRoom = client.getRoom();
    const aiPlayer: AiPlayer = aiHandler.add(player, room.name());

    if (isRoom(room)) {

      room.addAi(aiPlayer);

      client.broadcast("aiPlayerAdded", aiPlayer);

      if (room.isFull()) {

        client.emitToLobby("removeRoom", room);
      }
    }
  };
  const removeAiPlayer = (_: Error, player: any, socket: any): void => {

    const client: Client = clients.bySocket(socket);
    const room: AnyRoom = client.getRoom();
    const id = player.id;
    const aiPlayer: AnyPlayer = room.getPlayer(id);

    let wasFull: boolean;

    if (isRoom(room)) {

      room.removePlayer(id);

      wasFull = room.isFull();

      if (isAiPlayer(aiPlayer)) {

        aiHandler.remove(aiPlayer);

      } else {

        throw new Error("Attempt at removing Ai Player from Game failed, non ai players detected");
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
