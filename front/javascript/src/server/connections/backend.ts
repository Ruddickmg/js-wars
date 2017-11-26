import request = require("request-promise-native");
import {Game} from "../../game/game";
import {Map} from "../../game/map/map";
import {User} from "../../game/users/user";
import typeChecker, {TypeChecker} from "../../tools/validation/typeChecker";
import {isNumber} from "util";

type BackendId = number | string;

interface Parameters {
  method: string;
  uri: string;
  json: boolean;
}

export interface Backend {
  getLogin(password: string, email: string): Promise<any>;
  getUser(origin: string, id: BackendId): Promise<any>;
  getMaps(category: string): Promise<any>;
  getGames(id: BackendId): Promise<any>;
  saveGame(game: Game): Promise<any>;
  saveUser(user: User): Promise<any>;
  saveMap(map: Map): Promise<any>;
  deleteUser(id: BackendId): Promise<any>;
  deleteGame(id: BackendId): Promise<any>;
  deleteMap(id: BackendId): Promise<any>;
  sync(): Promise<any>;
  migrate(): Promise<any>;
}

export default function(url: string): Backend {
  const {isString}: TypeChecker = typeChecker();
  const json: boolean = true;
  const formatUrl = (path: string, input: string): string => {
    return `${url}${path}${isString(input) || isNumber(input) ? `/${input}` : ""}`;
  };
  const combine = (...objects: object[]) => Object.assign({}, ...objects);
  const makeRequest = (
    method: string,
    path: string = "",
    input?: string,
    headers: object = {},
  ): Promise<any> => {
    const uri: string = formatUrl(path, input);
    const requestParameters: Parameters = {json, method, uri};
    return request(combine(requestParameters, headers));
  };
  const get = (path: string, input?: any): Promise<any> => makeRequest("GET", path, input);
  const del = (path: string, input: any): Promise<any> => makeRequest("DELETE", path, input);
  const post = (path: string, body: any): Promise<any> => makeRequest("POST", path, void 0, {body});
  const deleteGame = (id: BackendId): Promise<any> => del("/games/remove", id);
  const deleteMap = (id: BackendId): Promise<any> => del("/maps/remove", id);
  const deleteUser = (id: BackendId): Promise<any> => del("/users/remove", id);
  const getGames = (id: BackendId): Promise<any> => get("/games/saved", id);
  const getLogin = (email: string, password: string): Promise<any> => get("/users/login", `${email}/${password}`);
  const getMaps = (category: string): Promise<any> => get("/maps/type", category);
  const getUser = (origin: string, id: BackendId): Promise<any> => get("/users", `${origin}/${id}`);
  const migrate = (): Promise<any> => get("/migrate").then((response) => {
    return response.success ?
      Promise.resolve(response) :
      Promise.reject(Error("Could not complete migration."));
  });
  const saveGame = (game: Game): Promise<any> => post("/games/save", game);
  const saveMap = (map: Map): Promise<any> => post("/maps/save", map);
  const saveUser = (user: User): Promise<any> => post("/users/save", user);
  const sync = (): Promise<any> => get("/sync").then(({error, response}): Promise<any> => {
    return error ?
      Promise.reject(Error("Could not sync with database.")) :
      Promise.resolve(response);
  });
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
    sync,
  };
}
