import {RoomId} from "../server/rooms/room";
import getSettings from "../settings/settings";
import {isArray, isBoolean, isDefined, isNull, isNumber, isObject, isString} from "../tools/validation/typeChecker";
import {isMap, Map} from "./map/map";
import {Player} from "./users/players/player";

export interface Game {
  id?: RoomId;
  name: string;
  category: string;
  players: Player[];
  settings: any;
  map: Map;
  started: boolean;
  saved: boolean;
  max: number;
  [index: string]: boolean | string | Map | Player[] | RoomId;
}

export default function(name: string = null, category: string = null, map: Map = null, id: RoomId = null) {
  const max: number = map ? map.maximumAmountOfPlayers : 0;
  const players: Player[] = [];
  const saved: boolean = false;
  const started: boolean = false;
  const settings: any = Object.assign({}, getSettings().toObject("game", "settings"));
  return {
    category,
    id,
    map,
    max,
    name,
    players,
    saved,
    settings,
    started,
  };
}

export function isGame(element: any): boolean {
  let map: Map;
  let category: string;
  let name: string;
  let bool: boolean = false;
  if (isDefined(element) && !isNull(element)) {
    map = element.map;
    category = element.category;
    name = element.name;
    bool = (isString(name) || isNull(name))
      && (isString(category) || isNull(category))
      && isNumber(element.max)
      && isArray(element.players)
      && (isMap(map) || isNull(map))
      && isBoolean(element.saved)
      && isBoolean(element.started)
      && isObject(element.settings);
  }
  return bool;
}
