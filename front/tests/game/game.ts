import {Player} from "../users/players/player";
import {RoomId} from "../rooms/room.spec";
import {Map} from "./map/mapController";

export interface Game {

    id: RoomId,
    name: string,
    category: string,
    background: string,
    players: Player[],
    map: Map,
    started: boolean,
    saved: boolean,
    max: number
}