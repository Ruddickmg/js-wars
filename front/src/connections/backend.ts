import request from "request-promise-native";

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
    saveGame(id: BackendId): Promise<any>;
    saveUser(user: string): Promise<any>;
    saveMap(map: string): Promise<any>;
    deleteUser(id: BackendId): Promise<any>;
    deleteGame(id: BackendId): Promise<any>;
    deleteMap(id: BackendId): Promise<any>;
    sync(): Promise<any>;
    migrate(): Promise<any>;
}

export default function(url: string): Backend {

    const formatUrl = (path: string, input: BackendId): string => `${url}${path}${input}`;
    const combine = (...objects: object[]) => Object.assign({}, ...objects);
    const makeRequest = (

        method: string,
        path: string = "",
        input: BackendId = "",
        headers: object = {},

    ): Promise<any> => {

        const json: boolean = true;
        const uri: string = formatUrl(path, input);
        const requestParameters: Parameters = {json, method, uri};
        const requestObject: object = combine(requestParameters, headers);

        return request(requestObject);
    };
    const get = (path: string, input?: BackendId): Promise<any> => makeRequest("GET", path, input);
    const del = (path: string, input: BackendId): Promise<any> => makeRequest("DELETE", path, input);
    const post = (path: string, input: BackendId): Promise<any> => makeRequest("POST", path, input, {
        body: JSON.stringify(input),
        headers: {"Content-Type" : "application/json"},
    });
    const deleteGame = (id: BackendId): Promise<any> => del("/games/remove", id);
    const deleteMap = (id: BackendId): Promise<any> => del("/maps/remove", id);
    const deleteUser = (id: BackendId): Promise<any> => del("/users/remove", id);
    const getGames = (id: BackendId): Promise<any> => get("/games/saved", id);
    const getLogin = (email: string, password: string): Promise<any> => get("/users/login", `${email}/${password}`);
    const getMaps = (category: string): Promise<any> => get("/maps/type", category);
    const getUser = (origin: string, id: BackendId): Promise<any> => get("/users", `${origin}/${id}`);
    const migrate = (): Promise<any> => get("/migrate").then(({success: migrationWasSuccessful}) => {

        return migrationWasSuccessful ?
            Promise.resolve(migrationWasSuccessful) :
            Promise.reject(new Error("Could not complete migration."));

    });
    const saveGame = (game: any): Promise<any> => post("/games/save", game);
    const saveMap = (map: string): Promise<any> => post("/maps/save", map);
    const saveUser = (user: string): Promise<any> => post("/users/save", user);
    const sync = (): Promise<any> => get("/sync").then(({error, results}): Promise<any> => {

        return error ?
            Promise.reject(new Error("Could not sync with database.")) :
            Promise.resolve(results);
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
