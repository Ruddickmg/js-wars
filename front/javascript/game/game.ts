import {RoomId} from "../server/rooms/room";
import typeChecker, {TypeChecker} from "../tools/validation/typeChecker";
import {isMap, Map} from "./map/map";
import {Player} from "./users/players/player";

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

export default function(name?: string, category?: string, map?: Map, id?: RoomId) {

    const max: number = map ? map.maximumAmountOfPlayers : 0;
    const background: string = null;
    const players: Player[] = [];
    const saved: boolean = false;
    const started: boolean = false;

    return {

        id,
        name,
        category,
        map,
        background,
        max,
        players,
        saved,
        started,
    };
}

export function isGame(element: any): boolean {

    const {isString, isNumber, isArray, isBoolean}: TypeChecker = typeChecker();
    const id: RoomId = element.id;

    return (isString(id) || isNumber(id))
        && isString(element.name)
        && isString(element.category)
        && isString(element.background)
        && isNumber(element.max)
        && isArray(element.players)
        && isMap(element.map)
        && isBoolean(element.saved)
        && isBoolean(element.started);
}
