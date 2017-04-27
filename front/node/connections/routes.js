"use strict";

const
    timeKeeper = require("../tools/calculations/time.js"),
    initBackend = require("./backend.js"),
    connections = require("./connections.js")(process.env);

function routes(app, sockets, root) {

    const
        time = timeKeeper(),
        backend = initBackend(connections.backend().url),
        syncDatabaseIdsWithSocketIds = () => {

            backend.sync()
                .then((ids) => sockets.reserveIds(ids))
                .catch((err) => console.log(err));
        },
        initializeDatabase = () => {

            const
                errorMessage = "Could not initialize database, connection timed out.",
                secondsTillTimeout = time.seconds(5),
                repeatedlyAttemptMigration = () => backend.migrate()
                    .then((res) => Promise.resolve(res))
                    .catch(() => repeatedlyAttemptMigration());

            return Promise.race([
                repeatedlyAttemptMigration(),
                time.wait(secondsTillTimeout)
                    .then(() => Promise.reject(new Error(errorMessage)))
            ]);
        };

    initializeDatabase()
        .then(() => syncDatabaseIdsWithSocketIds())
        .catch((err) => console.log(err));

    console.log(`path to index: ${root}/index.html`);

    app.get("/", (_, res) => {

        res.sendFile(`${root}/index.html`)
    });

    app.get("/games/open/:category", (req, res) => {

        res.json(sockets.getOpenRooms(req.params.category) || []);
        res.end();
    });

    app.get("/games/running/:category", (req, res) => {

        res.json(sockets.getRunningRooms(req.params.category) || []);
        res.end();
    });

    app.get("/games/saved/:id", (req, res) => {

        const id = req.params.id;

        backend.get_games(id)
            .then((game) => {

                res.json(game);
                sockets.checkForGame(game); // <--- what happened here?
            })
            .catch((err) => console.log(err));
    });

    app.get("/maps/type/:category", (req, res) => {

        backend.get_maps(req.params.category)
            .then((maps) => res.json(maps))
            .catch((err) => console.log(err));
    });

    app.post("/maps/save", (req, res) => {

        backend.save_map(req.body)
            .then((map) => res.json(map))
            .catch((err) => console.log(err));
    });

    app.post("/users/save", (req, res) => {

        // reminder
        console.log("handle validation etc before going live");

        // save the user and update its id from the database
        backend.save_user(req.body)
            .then((response) => {

                res.json(response);
                sockets.updateUser(response, req.body.id);
            })
            .catch((err) => console.log(err));
    });

    app.post("/users/oauth", (req, res) => {

        const id = req.body.id;

        backend.get_user(req.body.origin, id)
            .then((response) => sockets.updateUser(response, id))
            .catch((err) => console.log(err));
    });

    app.post ("/games/save", (req, res) => {

        const
            game = req.body.game,
            user = req.body.user;

        game.id = sockets.saveGame(user).id;

        backend.save_game(game)
            .then((game) => res.json(game))
            .catch((err) => console.log(game));
    });

    app.delete("/games/remove/:id", (req, res) => {

        backend.del_game(id)
            .then((response) => res.json(response))
            .catch((err) => console.log(err));
    });

    app.delete("/maps/remove/:id", (req, res) => {

        backend.del_map(id)
            .then((response) => res.json(response))
            .catch((err) => console.log(err));
    });

    app.delete("/users/remove/:id", (req, res) => {

        backend.del_user(id)
            .then((response) => res.json(response))
            .catch((err) => console.log(err));
    });
}

module.exports = routes;

