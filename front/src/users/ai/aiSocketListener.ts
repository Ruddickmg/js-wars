import {default as aiController, AiController} from "./aiController";
import {Listener} from "../../connections/sockets/listener";
import {ClientHandler} from "../../clients/clients";
import {AnyRoom, isRoom} from "../../rooms/rooms";
import {AiPlayer} from "./aiPlayer";
import {Client} from "../../clients/client";
import {AnyPlayer, isAiPlayer} from "../players/playerSocketListener";

export default function (clients: ClientHandler,  aiHandler: AiController): Listener {

    return {

        addAiPlayer(error: Error, player: any, socket: any): void {

            const
                client: Client = clients.bySocket(socket),
                room: AnyRoom = client.room(),
                aiPlayer: AiPlayer = aiHandler.addElement(player, room.name());

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

                    aiHandler.remove(aiPlayer);

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