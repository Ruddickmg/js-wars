import {Client} from "../clients/client";
import {ClientHandler} from "../clients/clients";
import {Listener} from "../connections/sockets/listener";
import {AiController} from "../users/ai/aiController";
import {default as createPlayer, Player} from "../users/players/player";
import {default as createUser, User, UserId} from "../users/user";
import {Lobby} from "./lobby";
import {Room} from "./room.spec";
import {isRoom, Rooms} from "./rooms.js";

export default function(clients: ClientHandler, rooms: Rooms, aiHandler: AiController): Listener {

    return {

        addUser(error: Error, {loginData, origin}: any, socket: any): void {

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

                clients.addElement(socket, id)
                    .setPlayer(player)
                    .setUser(user);
            }

            client = clients.byId(id);
            client.joinRoom(rooms.lobby());
            client.emit("player", player);
        },
        join(error: Error, room: any, socket: any): void {

            const client: Client = clients.bySocket(socket);
            const storedRoom: Room = rooms.get(room);

            if (error !== undefined) {

                throw error;
            }

            if (storedRoom) {

                client.joinRoom(storedRoom);
                client.emit("joinedGame", storedRoom.getGame());
                client.broadcast("getPlayerStates", true);
                client.broadcast("userJoined", client.player());

            } else {

                console.log("Room not found in join.");
            }
        },
        newRoom(error: Error, game: any, socket: any) {

            const client: Client = clients.bySocket(socket);
            const existingRoom: Room = rooms.get(game);

            let room: Room;

            if (error !== undefined) {

                throw error;
            }

            if (existingRoom) {

                client.emit("roomAlreadyExists", existingRoom.getGame());

            } else {

                room = rooms.addElement(game);
                client.joinRoom(room);
                client.emit("joinedGame", game);
                client.emitToLobby("addRoom", game);
            }
        },
        disconnect(error: Error, _: any, socket: any): void {

            const client: Client = clients.bySocket(socket);
            const room: Room | Lobby = client.room();

            if (error !== undefined) {

                throw error;
            }

            clients.disconnect(socket);

            if (isRoom(room) && room.isEmpty()) {

                rooms.remove(room);

                aiHandler.remove(...room.getAiPlayers());
            }
        },
    };
};