import {RoomId} from "../rooms/room";
import {Player} from "../users/players/player";
import {Map} from "./map/map";

export interface Game {

    id: RoomId;
    name: string;
    category: string;
    background: string;
    players: Player[];
    map: Map;
    started: boolean;
    saved: boolean;
    max: number;
    [index: string]: boolean | string | Map | Player[] | RoomId;
}
