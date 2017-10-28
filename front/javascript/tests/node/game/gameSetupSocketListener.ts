import {Client} from "../server/clients/client";
import {ClientHandler} from "../server/clients/clients";
import {AnyRoom, isRoom, Rooms} from "../server/rooms/rooms";
import {Game} from "./game.spec";
import {Player} from "./users/players/player";

export default function(clients: ClientHandler, rooms: Rooms) {

  return {

    background(error: Error, type: string, socket: any): void {

      const client: Client = clients.bySocket(socket);
      const room: AnyRoom = client.getRoom();

      if (error !== undefined) {

        throw error;
      }

      if (isRoom(room)) {

        room.getGame().background = type;

        client.broadcast("background", type);
      }
    },
    start(error: Error, game: Game, socket: any): void {

      if (error !== undefined) {

        throw error;
      }

      clients.bySocket(socket).broadcast("start", game);
    },
    allPlayersAreReady(error: Error, isReady: boolean, socket: any): void {

      const client: Client = clients.bySocket(socket);
      const player: Player = client.getPlayer();

      if (error !== undefined) {

        throw error;
      }

      player.allPlayersAreReady = isReady;

      client.broadcast("readyStateChange", player);
    },
    setUserProperties(error: Error, properties: any, socket: any): void {

      const {player, property, value} = properties;
      const client: Client = clients.bySocket(socket);
      const storedPlayer: Player = client.getRoom()
        .getPlayer(player);

      if (error !== undefined) {

        throw error;
      }

      if (storedPlayer) {

        storedPlayer[property] = value;
      }

      client.broadcast("propertyChange", error || properties);
    },
    gameReadyChat(error: Error, message: any, socket: any): void {

      if (error !== undefined) {

        throw error;
      }

      clients.bySocket(socket).broadcast("gameReadyMessage", message);
    },
    setMap(error: Error, map: any, socket: any) {

      if (error !== undefined) {

        throw error;
      }

      socket.broadcast
        .moveTo(socket.getRoom.name)
        .emit("setMap", map);
    },
    boot(error: Error, bootedPlayer: any, socket: any): void {

      const client: Client = clients.bySocket(socket);
      const room = client.getRoom();
      const player: Player = room.getPlayer(bootedPlayer.id);

      if (error !== undefined) {

        throw error;
      }

      if (player) {

        client.emit("back", true);
        client.joinRoom(rooms.lobby());
        client.broadcast("userRemoved", player);

      } else {

        client.broadcast("userRemoved", false);
      }
    },
  };
}