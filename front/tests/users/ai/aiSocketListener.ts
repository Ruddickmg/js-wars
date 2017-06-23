import {default as aiController, AiController} from "./aiController";
import {Listener} from "../../connections/sockets/listener.spec";
import {ClientHandler} from "../../clients/clients.spec";
import {AnyRoom, isRoom} from "../../rooms/rooms.spec";
import {AiPlayer} from "./aiPlayer";
import {Client} from "../../clients/client.spec";
import {AnyPlayer, isAiPlayer} from "../players/playerSocketListener.spec";

export default function (clients: ClientHandler,  aiHandler: AiController): Listener {

    return {

        addAiPlayer(error: Error, player: any, socket: any): void {

            const
                client: Client = clients.bySocket(socket),
                room: AnyRoom = client.room(),
                aiPlayer: AiPlayer = aiHandler.addPlayer(player, room.name());

            if (isRoom(room)) {

                room.addAi(aiPlayer);

                client.broadcast("aiPlayerAdded", aiPlayer);

                if (room.isFull()) {

                    client.emitToLobby("removeRoom", room);
                }
            }
        },

        removeAiPlayer(error: Error, player: any, socket: any): void {

            const
                client: Client = clients.bySocket(socket),
                room: AnyRoom = client.room(),
                aiPlayer: AnyPlayer = room.getPlayer(player.id);

            let wasFull: boolean;

            if (isRoom(room)) {

                room.removePlayer(aiPlayer);

                wasFull = room.isFull();

                if (isAiPlayer(aiPlayer)) {

                    aiHandler.removePlayer(aiPlayer);

                } else {

                    throw new Error("Attempt at removing Ai Player from Game failed, non ai players detected");
                }

                if (wasFull) {

                    client.emitToLobby("addRoom", room.getGame());
                }
            }
        }
    };
};