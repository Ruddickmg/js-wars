import {Game} from "../../game/game";
import {User} from "../../game/users/user";
import time, {Time} from "../../tools/calculations/time";
import notifications, {PubSub} from "../../tools/pubSub";
import {Client} from "../clients/client";
import {ClientHandler} from "../clients/clients";
import {AnyRoom, isRoom, Rooms} from "../rooms/rooms";
import initBackend, {Backend} from "./backend";
import connections, {Connections} from "./connections";

const connection: Connections = connections(process.env);

export default function(app: any, rooms: Rooms, clients: ClientHandler, root: string): void {

  const {publish}: PubSub = notifications();
  const url: string = connection.backend().url;
  const periodOfTime: Time = time();
  const backend: Backend = initBackend(url);
  const errorEventId: string = "error";
  const browserErrorEventId: string = "browserError";
  const syncDatabaseIdsWithRoomIds = (): void => {

    backend.sync()
      .then((ids) => rooms.addReservedIds(ids))
      .catch((error: Error) => publish("error", error));
  };
  const initializeDatabase = (): Promise<any> => {

    const errorMessage: string = "Could not initialize database, connection timed out.";
    const secondsTillTimeout: number = periodOfTime.seconds(5);
    const repeatedlyAttemptMigration = (): Promise<any> => backend.migrate()
      .then((res) => Promise.resolve(res))
      .catch(() => repeatedlyAttemptMigration());

    return Promise.race([
      // repeatedlyAttemptMigration(),
      // periodOfTime.wait(secondsTillTimeout)
      //   .then(() => Promise.reject(new Error(errorMessage))),
    ]);
  };

  initializeDatabase()
    .then(() => syncDatabaseIdsWithRoomIds())
    .catch((error: Error) => publish(errorEventId, error));

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

  app.get("/games/saved/:id", (req: any): void => {

    const id: string = req.params.id;

    backend.getGames(id)
      .then((game: Game[]) => rooms.matchRunningGames(game))
      .catch((error: Error): any => publish(errorEventId, error));
  });

  app.get("/maps/type/:category", (req: any, res: any): void => {

    backend.getMaps(req.params.category)
      .then((maps) => res.json(maps))
      .catch((error: Error) => publish(errorEventId, error));
  });

  app.post("/errors", (req: any): void => publish(browserErrorEventId, req.body));

  app.post("/maps/save", (req: any, res: any): void => {

    backend.saveMap(req.body)
      .then((response: any) => res.json(response))
      .catch((error: Error) => publish(errorEventId, error));
  });

  app.post("/users/save", (req: any, res: any): void => {

    // TODO validate

    // save the user and update its id from the database
    backend.saveUser(req.body)
      .then((response) => {

        res.json(response);
        clients.updateUser(response, req.body.id);
      })
      .catch((error: Error) => publish(errorEventId, error));
  });

  app.post("/users/oauth", (req: any): void => {

    // TODO validate

    const id: string = req.body.id;

    backend.getUser(req.body.origin, id)
      .then((response) => clients.updateUser(response, id))
      .catch((error: Error) => publish(errorEventId, error));
  });

  app.post("/games/save", (req: any, res: any): void => {

    // TODO validate

    const game: Game = req.body.game;
    const user: User = req.body.user;
    const client: Client = clients.byId(user.id);
    const room: AnyRoom = client.getRoom();

    if (isRoom(room)) {

      game.id = room.getGame().id;

      backend.saveGame(JSON.stringify(game))
        .then((receivedGame) => res.json(receivedGame))
        .catch((error: Error) => publish(errorEventId, error));
    }
  });

  app.delete("/games/remove/:id", (req: any, res: any): void => {

    // TODO validate

    backend.deleteGame(req.params.id)
      .then((gameRemovalStatus) => res.json(gameRemovalStatus))
      .catch((error: Error) => publish(errorEventId, error));
  });

  app.delete("/maps/remove/:id", (req: any, res: any): void => {

    // TODO validate

    backend.deleteMap(req.params.id)
      .then((mapRemovalStatus) => res.json(mapRemovalStatus))
      .catch((error: Error) => publish(errorEventId, error));
  });

  app.delete("/users/remove/:id", (req: any, res: any): void => {

    // TODO validate

    backend.deleteUser(req.params.id)
      .then((userRemovalStatus) => res.json(userRemovalStatus))
      .catch((error: Error) => publish(errorEventId, error));
  });
}
