import {Room, RoomId} from "../rooms/room";
import {Player} from "../users/players/player";
import {Map} from "./map/map";

export interface Game {

    id?: RoomId;
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

export default function(name: string, category: string, map: Map, id?: RoomId) {

    return {

        id,
        name,
        category,
        map,
        background: "",
        max: map.maximumAmountOfPlayers,
        players: [] as Player[],
        saved: false,
        started: false,
    };
}
