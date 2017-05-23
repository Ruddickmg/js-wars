import {Lobby} from "../rooms/lobby";
import {Room} from "../rooms/room";
import {AnyRoom, isRoom} from "../rooms/rooms";
import {Player} from "../users/players/player";
import {User} from "../users/user";

export interface Client {

    emit: any;
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
            .moveTo(roomName)
            .emit(path, value);

        return this;
    };

    const disconnect = function(): Client {

        if (room && isRoom(room)) {

            socket.leave(room.name());

            if (room.isSaved()) {

                broadcast("userLeftRoom", {room: room.getGame(), player});
            }
        }

        if (player) {

            broadcast("disconnected", player);
        }

        removePlayerFromRoom(player, room);

        return this;
    };

    const emit = socket.emit;

    const emitToLobby = function(path: string, value: any): Client {

        broadcast(path, value, "lobby");

        return this;
    };

    const joinRoom = (currentRoom: AnyRoom): Room | Lobby => {

        if (room && player) {

            removePlayerFromRoom(player, room);
        }

        room = currentRoom;

        socket.join(room.name());

        if (player) {

            room.addPlayer(player);
        }

        return room;
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
