"use strict";

const request = require("request-promise-native");

function backend (url) {

    const
        formatUrl = (path, input) => `${url}${path}${input}`,
        combine = (...objects) => Object.assign({}, ...objects),
        makeRequest = (method, path="", input="", headers={}) => {

            const
                parameters = {

                    method: method,
                    uri: formatUrl(path, input),
                    json: true
                },
                requestObject = combine(parameters, headers);

            return request(requestObject);
        },
        get = (path, input) => makeRequest("GET", path, input),
        del = (path, input) => makeRequest("DELETE", path, input),
        post= (path, input) => makeRequest("POST", path, input, {
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify(input)
        });

    return {

        get_login: (email, password) => get("/users/login", `${email}/${password}`),
        get_user: (origin, id) => get("/users",`${origin}/${id}`),
        get_maps: (category) => get("/maps/type", category),
        get_games: (id) => get("/games/saved", id),
        save_game: (game) => post("/games/save", game),
        save_user: (user) => post("/users/save", user),
        save_map: (map) => post("/maps/save", map),
        del_user: (id) => del("/users/remove", id),
        del_game: (id) => del("/games/remove", id),
        del_map: (id) => del("/maps/remove", id),
        sync: () => get("/sync").then(({error, results}) => {

            return error ?
                Promise.reject(new Error("Could not sync with database.")):
                Promise.resolve(results);
        }),
        migrate: () => get("/migrate").then(({success: migrationWasSuccessful}) => {

            return migrationWasSuccessful ?
                Promise.resolve(migrationWasSuccessful):
                Promise.reject(new Error("Could not complete migration."));
        })
    };
}

module.exports = backend;