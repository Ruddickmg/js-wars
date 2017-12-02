import getAiController, {AiController} from "../../game/users/ai/aiController";
import createPlayer, {Player} from "../../game/users/players/player";
import {User, UserId} from "../../game/users/user";
import notifications, {PubSub} from "../../tools/pubSub";
import {Client} from "../clients/client";
import getClientHandler, {ClientHandler} from "../clients/clients";
import {Listener} from "../connections/sockets/listener";
import {Lobby} from "./lobby";
import {isRoom, Room} from "./room";
import getRoomHandler, {Rooms} from "./rooms";

export default function(): Listener {
  const {publish}: PubSub = notifications();
  const aiHandler: AiController = getAiController();
  const rooms: Rooms = getRoomHandler();
  const clients: ClientHandler = getClientHandler();
  const addUser = (user: User, socket: any): void => {
    const player: Player = createPlayer(user);
    const userId: UserId = user.id;
    let client;
    if (clients.wasDisconnected(userId)) {
      clients.reconnect(userId).setSocket(socket);
    } else {
      clients.add(socket, userId)
        .setPlayer(player)
        .setUser(user);
    }
    client = clients.byId(userId);
    client.joinRoom(rooms.lobby());
    client.emit("player", player);
  };
  const join = (room: any, socket: any): void => {
    const client: Client = clients.bySocket(socket);
    const storedRoom: Room = rooms.get(room);
    if (isRoom(storedRoom)) {
      client.joinRoom(storedRoom);
      client.emit("joinedGame", storedRoom.getGame());
      client.broadcast("getPlayerStates", true);
      client.broadcast("userJoined", client.getPlayer());
    } else {
      publish("error", "Invalid room found in call to join on the roomsSocketListener.");
    }
  };
  const newRoom = (game: any, socket: any) => {
    const client: Client = clients.bySocket(socket);
    const existingRoom: Room = rooms.get(game);
    let room: Room;
    if (isRoom(existingRoom)) {
      client.emit("roomAlreadyExists", existingRoom.getGame());
    } else {
      room = rooms.add(game);
      client.joinRoom(room);
      client.emit("joinedGame", game);
      client.emitToLobby("addRoom", game);
    }
  };
  const disconnect = (_: any, socket: any): void => {
    const client: Client = clients.bySocket(socket);
    const room: Room | Lobby = client.getRoom();
    clients.disconnect(socket);
    if (isRoom(room) && room.isEmpty()) {
      rooms.remove(room);
      aiHandler.remove(...room.getAiPlayers());
    }
  };
  return {
    addUser,
    disconnect,
    join,
    newRoom,
  };
}
