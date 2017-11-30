import getAiController, {AiController} from "../../game/users/ai/aiController";
import createPlayer, {Player} from "../../game/users/players/player";
import createUser, {User, UserId} from "../../game/users/user";
import {Client} from "../clients/client";
import getClientHandler, {ClientHandler} from "../clients/clients";
import {Listener} from "../connections/sockets/listener";
import {Lobby} from "./lobby";
import {Room} from "./room";
import getRoomHandler, {isRoom, Rooms} from "./rooms";

export default function(): Listener {
  const aiHandler: AiController = getAiController();
  const rooms: Rooms = getRoomHandler();
  const clients: ClientHandler = getClientHandler();
  const addUser = (error: Error, {loginData, origin}: any, socket: any): void => {
    const user: User = createUser(loginData, origin);
    const player: Player = createPlayer(user);
    const id: UserId = user.id;
    let client;
    if (error !== undefined) {
      throw error;
    }
    if (clients.wasDisconnected(id)) {
      clients.reconnect(id).setSocket(socket);
    } else {
      clients.add(socket, id)
        .setPlayer(player)
        .setUser(user);
    }
    client = clients.byId(id);
    client.joinRoom(rooms.lobby());
    client.emit("player", player);
  };
  const join = (error: Error, room: any, socket: any): void => {
    const client: Client = clients.bySocket(socket);
    const storedRoom: Room = rooms.get(room);
    if (error !== undefined) {
      throw error;
    }
    if (storedRoom) {
      client.joinRoom(storedRoom);
      client.emit("joinedGame", storedRoom.getGame());
      client.broadcast("getPlayerStates", true);
      client.broadcast("userJoined", client.getPlayer());
    } else {
      throw new Error("Room not found in join.");
    }
  };
  const newRoom = (error: Error, game: any, socket: any) => {
    const client: Client = clients.bySocket(socket);
    const existingRoom: Room = rooms.get(game);
    let room: Room;
    if (error !== undefined) {
      throw error;
    }
    if (existingRoom) {
      client.emit("roomAlreadyExists", existingRoom.getGame());
    } else {
      room = rooms.add(game);
      client.joinRoom(room);
      client.emit("joinedGame", game);
      client.emitToLobby("addRoom", game);
    }
  };
  const disconnect = (error: Error, _: any, socket: any): void => {
    const client: Client = clients.bySocket(socket);
    const room: Room | Lobby = client.getRoom();
    if (error !== undefined) {
      throw error;
    }
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
