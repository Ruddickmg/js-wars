import {subscribe} from "../tools/pubSub";
import {Map} from "./map/map";
import {Player} from "./users/players/player";
import {User} from "./users/user";

let user: User;
let map: Map;

export interface GameSetup {
  setUser(currentUser: User): void;
}
export const players: Player[] = [];
export const isFull = (): boolean => map.maximumAmountOfPlayers <= players.length;
export function setUser(currentUser: User): void {
  user = currentUser;
}
export function setMap(selectedMap: Map): void {
  map = selectedMap;
}
export function addPlayer(player: Player): void {
  if (!isFull()) {
    players.push(player);
  }
}
subscribe("addUser", setUser);
subscribe("setGameMap", setMap);
subscribe("addPlayer", addPlayer);
