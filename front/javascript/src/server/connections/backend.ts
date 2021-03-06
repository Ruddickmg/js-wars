import {RequestPromise} from "@types/request-promise-native";
import request = require("request-promise-native");
import {Game} from "../../game/game";
import {Map} from "../../game/map/map";
import {User} from "../../game/users/user";
import single from "../../tools/storage/singleton";
import formatUrl from "../../tools/stringManipulation/formatUrl";

type BackendId = number | string;

interface Parameters {
  method: string;
  uri: string;
  json: boolean;
}

export interface Backend {
  getLogin(password: string, email: string, database?: string): RequestPromise<any>;
  getUser(origin: string, id: BackendId, database?: string): RequestPromise<any>;
  getMaps(category: string, database?: string): RequestPromise<any>;
  getGames(id: BackendId, database?: string): RequestPromise<any>;
  saveGame(game: Game, database?: string): RequestPromise<any>;
  saveUser(user: User, database?: string): RequestPromise<any>;
  saveMap(map: Map, database?: string): RequestPromise<any>;
  deleteUser(id: BackendId, database?: string): RequestPromise<any>;
  deleteGame(id: BackendId, database?: string): RequestPromise<any>;
  deleteMap(id: BackendId, database?: string): RequestPromise<any>;
  migrate(database?: string): Promise<any>;
}

export default single<Backend>(function(url: string): Backend {

  const json: boolean = true;
  const addToUrl = formatUrl(url);
  const combine = (...objects: object[]) => Object.assign({}, ...objects);
  const del = (path: string, input: any): RequestPromise<any> => makeRequest("DELETE", path, input);
  const deleteGame = (game_id: BackendId, database?: string): RequestPromise<any> => del("games", {game_id, database});
  const deleteMap = (map_id: BackendId, database?: string): RequestPromise<any> => del("maps", {map_id, database});
  const deleteUser = (user_id: BackendId, database?: string): RequestPromise<any> => del("users", {user_id, database});
  const get = (path: string, input?: any): RequestPromise<any> => makeRequest("GET", path, input);
  const getGames = (user_id: BackendId, database?: string): RequestPromise<any> => get("games", {user_id, database});
  const getLogin = (email: string, password: string, database?: string): RequestPromise<any> => {
    return get("login", {email, password, database});
  };
  const getMaps = (category: string, database?: string): RequestPromise<any> => get("maps", {category, database});
  const getUser = (origin: string, user_id: BackendId, database?: string): RequestPromise<any> => {
    return get("users", {origin, user_id, database});
  };

  const makeRequest = (
    method: string,
    path: string = "",
    input?: any,
    headers: object = {},
  ): RequestPromise<any> => {
    const uri: string = addToUrl(`/${path}`, input);
    const requestParameters: Parameters = {json, method, uri};
    return request(combine(requestParameters, headers));
  };

  const migrate = (database?: string): Promise<any> => get("migrate", {database}).then((response) => {
    return response.success ?
      Promise.resolve(response) :
      Promise.reject(Error("Could not complete migration."));
  });

  const post = (path: string, body: any, database?: string): RequestPromise<any> => {
    return makeRequest("POST", path, {database}, {body});
  };

  const saveGame = (game: Game, database?: string): RequestPromise<any> => post("games", game, database);
  const saveMap = (map: Map, database?: string): RequestPromise<any> => post("maps", map, database);
  const saveUser = (user: User, database?: string): RequestPromise<any> => post("users", user, database);

  return {
    deleteGame,
    deleteMap,
    deleteUser,
    getGames,
    getLogin,
    getMaps,
    getUser,
    migrate,
    saveGame,
    saveMap,
    saveUser,
  };
});
