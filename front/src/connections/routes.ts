import {Client} from "../clients/client";
import {ClientHandler} from "../clients/clients";
import {Game} from "../game/game";
import {AnyRoom, isRoom, Rooms} from "../rooms/rooms";
import {default as time, Time} from "../tools/calculations/time.js";
import {User} from "../users/user";
import {Backend, default as initBackend} from "./backend.js";
import {Connections, default as connections} from "./connections.js";

const connection: Connections = connections(process.env);

export default function(app: any, rooms: Rooms, clients: ClientHandler, root: string): void {

    const url: string = connection.backend().url;
    const periodOfTime: Time = time();
    const backend: Backend = initBackend(url);
    const syncDatabaseIdsWithRoomIds = (): void => {

        backend.sync()
            .then((ids) => rooms.addReservedIds(ids))
            .catch((err) => console.log(err));
    };
    const initializeDatabase = (): Promise<any> => {

        const errorMessage: string = "Could not initialize database, connection timed out.";
        const secondsTillTimeout: number = periodOfTime.seconds(5);
        const repeatedlyAttemptMigration = (): Promise<any> => backend.migrate()
            .then((res) => Promise.resolve(res))
            .catch(() => repeatedlyAttemptMigration());

        return Promise.race([
            repeatedlyAttemptMigration(),
            periodOfTime.wait(secondsTillTimeout)
                .then(() => Promise.reject(new Error(errorMessage))),
        ]);
    };

    initializeDatabase()
        .then(() => syncDatabaseIdsWithRoomIds())
        .catch((err) => console.log(err));

    app.get("/", (_: any, res: any): void => {

        res.sendFile(`${root}/index.html`);
    });

    app.get("/games/open/:category", (req: any, res: any): void => {

        res.json(rooms.getOpenRooms(req.params.category) || []);
        res.end();
    });

    app.get("/games/running/:category", (req: any, res: any): void => {

        res.json(rooms.getRunningRooms(req.params.category) || []);
        res.end();
    });

    app.get("/games/saved/:id", (req: any, res: any): void => {

        const id: string = req.params.id;

        backend.getGames(id)
            .then((game: Game[]) => {

                res.json(game);
                rooms.matchRunningGames(game);
            })
            .catch((error: Error) => console.log(error));
    });

    app.get("/maps/type/:category", (req: any, res: any): void => {

        backend.getMaps(req.params.category)
            .then((maps) => res.json(maps))
            .catch((err) => console.log(err));
    });

    app.post("/maps/save", (req: any, res: any): void => {

        backend.saveMap(req.body)
            .then((map) => res.json(map))
            .catch((err) => console.log(err));
    });

    app.post("/users/save", (req: any, res: any): void => {

        // reminder
        console.log("handle validation etc before going live");

        // save the user and update its id from the database
        backend.saveUser(req.body)
            .then((response) => {

                res.json(response);
                clients.updateUser(response, req.body.id);
            })
            .catch((error) => console.log(error));
    });

    app.post("/users/oauth", (req: any): void => {

        const id: string = req.body.id;

        backend.getUser(req.body.origin, id)
            .then((response) => clients.updateUser(response, id))
            .catch((error) => console.log(error));
    });

    app.post ("/games/save", (req: any, res: any): void => {

        const game: Game = req.body.game;
        const user: User = req.body.user;
        const client: Client = clients.byId(user.id);
        const room: AnyRoom = client.getRoom();

        if (isRoom(room)) {

            game.id = room.getGame().id;

            backend.saveGame(JSON.stringify(game))
                .then((receivedGame) => res.json(receivedGame))
                .catch((error) => console.log(error));
        }
    });

    app.delete("/games/remove/:id", (_: any, res: any): void => {

        backend.deleteGame(id)
            .then((gameRemovalStatus) => res.json(gameRemovalStatus))
            .catch((error) => console.log(error));
    });

    app.delete("/maps/remove/:id", (_: any, res: any): void => {

        backend.deleteMap(id)
            .then((mapRemovalStatus) => res.json(mapRemovalStatus))
            .catch((error) => console.log(error));
    });

    app.delete("/users/remove/:id", (_: any, res: any): void => {

        backend.deleteUser(id)
            .then((userRemovalStatus) => res.json(userRemovalStatus))
            .catch((error) => console.log(error));
    });
}
