import {RoomId} from "../server/rooms/room";
import getSettings from "../settings/settings";
import typeChecker, {TypeChecker} from "../tools/validation/typeChecker";
import {isMap, Map} from "./map/map";
import {Player} from "./users/players/player";

export interface Game {
  id?: RoomId;
  name: string;
  category: string;
  background: string;
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
  const background: string = "plain";
  const players: Player[] = [];
  const saved: boolean = false;
  const started: boolean = false;
  const settings: any = Object.assign({}, getSettings().toObject("game", "settings"));
  return {
    id,
    name,
    category,
    map,
    background,
    max,
    players,
    saved,
    settings,
    started,
  };
}

export function isGame(element: any): boolean {
  const {isString, isNumber, isNull, isArray, isBoolean, isDefined, isObject}: TypeChecker = typeChecker();
  let id: RoomId;
  let map: Map;
  let category: string;
  let name: string;
  let bool: boolean = false;
  if (isDefined(element)) {
    id = element.id;
    map = element.map;
    category = element.category;
    name = element.name;
    bool = (isString(id) || isNumber(id))
      && (isString(name) || isNull(name))
      && (isString(category) || isNull(category))
      && isString(element.background)
      && isNumber(element.max)
      && isArray(element.players)
      && (isMap(map) || isNull(map))
      && isBoolean(element.saved)
      && isBoolean(element.started)
      && isObject(element.settings);
  }
  return bool;
}
