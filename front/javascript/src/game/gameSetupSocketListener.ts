import {Client} from "../server/clients/client";
import {ClientHandler} from "../server/clients/clients";
import {isRoom, Room} from "../server/rooms/room";
import {Rooms} from "../server/rooms/rooms";
import {Game} from "./game";
import {Player} from "./users/players/player";

export default function(clients: ClientHandler, rooms: Rooms) {
  return {
    background(type: string, socket: any): void {
      const client: Client = clients.bySocket(socket);
      const room: Room = client.getRoom() as Room;
      if (isRoom(room)) {
        room.getGame().background = type;
        client.broadcast("background", type);
      }
    },
    start(game: Game, socket: any): void {
      clients.bySocket(socket).broadcast("start", game);
    },
    allPlayersAreReady(isReady: boolean, socket: any): void {
      const client: Client = clients.bySocket(socket);
      const player: Player = client.getPlayer();
      player.allPlayersAreReady = isReady;
      client.broadcast("readyStateChange", player);
    },
    setUserProperties(properties: any, socket: any): void {
      const {player, property, value} = properties;
      const client: Client = clients.bySocket(socket);
      const storedPlayer: Player = client.getRoom()
        .getPlayer(player);
      if (storedPlayer) {
        storedPlayer[property] = value;
      }
      client.broadcast("propertyChange", properties);
    },
    gameReadyChat(message: any, socket: any): void {
      clients.bySocket(socket).broadcast("gameReadyMessage", message);
    },
    setMap(map: any, socket: any) {
      clients.bySocket(socket).broadcast("setMap", map);
    },
    boot(bootedPlayer: any, socket: any): void {
      const client: Client = clients.bySocket(socket);
      const room = client.getRoom();
      const player: Player = room.getPlayer(bootedPlayer.id);
      if (player) {
        client.broadcast("back", true);
        client.joinRoom(rooms.lobby());
        client.broadcast("userRemoved", player);
      } else {
        client.broadcast("userRemoved", false);
      }
    },
  };
}
