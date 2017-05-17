import {Room} from "../rooms/room";
import {AnyRoom, isRoom} from "../rooms/rooms";
import {Player} from "../users/players/player";
import {Lobby} from "../rooms/lobby";
import {User} from "../users/user";

export interface Client {

    emit: Function,
    room(): AnyRoom,
    socket(): any,
    player(): Player,
    user(): User,
    broadcast(path: string, value: any): Client,
    emitToLobby(path: string, value: any): Client,
    joinRoom(currentRoom: AnyRoom): AnyRoom,
    setPlayer(currentPlayer: Player): Client,
    setUser(currentUser: User): Client,
    setSocket(currentSocket: any): Client,
    disconnect(): Client
}

export default function(initialSocket: any): Client {

    let
        room: AnyRoom = undefined,
        user: User = undefined,
        player: Player = undefined,
        socket = initialSocket;

    const
        removePlayerFromRoom = (player: Player, room: AnyRoom): Player => {

            if (isRoom(room)) {

                room.removePlayer(player);

            } else {

                room.removePlayer(player.id);
            }

            return player;
        },
        broadcast = (path: string, value: any, roomName: string=room.name()) => {

        socket.broadcast
            .moveTo(roomName)
            .emit(path, value);
    };

    return {

        emit: socket.emit,
        room: (): AnyRoom => room,
        socket: (): any => socket,
        player: (): Player => player,
        user: (): User => user,
        broadcast(path: string, value: any): Client {

           broadcast(path, value);

            return this;
        },

        emitToLobby(path: string, value: any): Client {

            broadcast(path, value, "lobby");

            return this;
        },

        joinRoom(currentRoom: AnyRoom): Room | Lobby {

            if (room && player) {

               removePlayerFromRoom(player, room);
            }

            room = currentRoom;

            socket.join(room.name);

            if (player) {

                room.addElement(player);
            }

            return room;
        },
        setPlayer(currentPlayer: Player): Client {

            player = currentPlayer;

            return this;
        },
        setUser(currentUser: User): Client {

            user = currentUser;

            return this;
        },
        setSocket(currentSocket: any): Client {

            socket = currentSocket;

            return this;
        },
        disconnect(): Client {

            socket.leave(room.name());

            if (isRoom(room) && room.hasBeenSaved()) {

                broadcast("userLeftRoom", {room: room.getGame(), player});
            }

            if (player) {

                broadcast("disconnected", player);
            }

            removePlayerFromRoom(player, room);

            return this;
        }
    };
}