import {Player} from "../../game/users/players/player";
import {User} from "../../game/users/user";
import {Lobby} from "../rooms/lobby";
import {Room} from "../rooms/room";
import {AnyRoom, isRoom} from "../rooms/rooms";

export interface Client {
  emit(path: string, data: any): Client;
  getRoom(): AnyRoom;
  getSocket(): any;
  getPlayer(): Player;
  getUser(): User;
  broadcast(path: string, value: any): Client;
  emitToLobby(path: string, value: any): Client;
  joinRoom(currentRoom: AnyRoom): AnyRoom;
  setPlayer(currentPlayer: Player): Client;
  setUser(currentUser: User): Client;
  setRoom(room: AnyRoom): AnyRoom;
  setSocket(currentSocket: any): Client;
  disconnect(): Client;
}

export default function(initialSocket: any): Client {
  let room: AnyRoom;
  let user: User;
  let player: Player;
  let socket = initialSocket;
  const lobby: string = "lobby";
  const removePlayerFromRoom = (currentPlayer: Player, currentRoom: AnyRoom): Player => {
    let id;
    if (player) {
      id = currentPlayer.id;
      if (room && isRoom(currentRoom)) {
        currentRoom.removePlayer(id);
      }
    } else {
      throw new TypeError("No player found in call to removePlayerFromRoom.");
    }
    return currentPlayer;
  };
  const broadcast = function(path: string, value: any, roomName: string = room.name()): Client {
    socket.broadcast
      .to(roomName)
      .emit(path, value);
    return this;
  };
  const disconnect = function(): Client {
    if (player) {
      broadcast("disconnected", player);
    }
    if (room && isRoom(room)) {
      socket.leave(room.name());
      if (room.isSaved()) {
        broadcast("userLeftRoom", {room: room.getGame(), player});
      }
    }
    removePlayerFromRoom(player, room);
    return this;
  };
  const emit = function(path: string, data: any): Client {
    socket.emit(path, data);
    return this;
  };
  const emitToLobby = function(path: string, value: any): Client {
    broadcast(path, value, lobby);
    return this;
  };
  const joinRoom = (selectedRoom: AnyRoom): Room | Lobby => {
    if (player) {
      if (isRoom(room)) {
        removePlayerFromRoom(player, room);
      }
      if (isRoom(selectedRoom)) {
        selectedRoom.addPlayer(player);
      }
    }
    return setRoom(selectedRoom);
  };
  const getPlayer = (): Player => player;
  const getRoom = (): AnyRoom => room;
  const setRoom = (desiredRoom: AnyRoom): AnyRoom => {
    if (isRoom(desiredRoom)) {
      room = desiredRoom;
      socket.join(room.name());
    }
    return room;
  };
  const getSocket = (): any => socket;
  const setPlayer = function(currentPlayer: Player): Client {
    player = currentPlayer;
    return this;
  };
  const setSocket = function(currentSocket: any): Client {
    socket = currentSocket;
    return this;
  };
  const setUser = function(currentUser: User): Client {
    user = currentUser;
    return this;
  };
  const getUser = (): User => user;
  return {
    broadcast,
    disconnect,
    emit,
    emitToLobby,
    joinRoom,
    getPlayer,
    getRoom,
    getSocket,
    setPlayer,
    setRoom,
    setSocket,
    setUser,
    getUser,
  };
}
