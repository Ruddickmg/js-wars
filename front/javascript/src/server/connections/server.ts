import bodyParser = require("body-parser");
import express = require("express");
import http = require("http");
import {Game, isGame} from "../../game/game";
import {isMap, Map} from "../../game/map/map";
import {isUser, User} from "../../game/users/user";
import {publish} from "../../tools/pubSub";
import {isDefined} from "../../tools/validation/typeChecker";
import {Client} from "../clients/client";
import getClientHandler, {ClientHandler} from "../clients/clients";
import {isRoom} from "../rooms/room";
import getRoomsHandler, {Rooms} from "../rooms/rooms";
import getBackend, {Backend} from "./backend";
import connections, {Connections} from "./connections";

export default function(
  pathToRootDirectory: string,
  connection: Connections = connections(process.env),
): any {
  const app: any = express();
  const server: any = http.createServer(app);
  const staticFileDirectory: any = express.static(`${pathToRootDirectory}/public`);
  const errorEventId: string = "error";
  const browserErrorEventId: string = "browserError";
  const handleError = (res: any) => (error: Error): any => {
    publish(errorEventId, error);
    res.json(error);
    res.end();
  };
  const frontEnd: any = connection.frontend();
  const url: string = frontEnd.url;
  const backendUrl: string = connection.backend().url;
  const rooms: Rooms = getRoomsHandler(url);
  const backend: Backend = getBackend(backendUrl);
  const clients: ClientHandler = getClientHandler();
  app.use(staticFileDirectory);
  app.use(bodyParser.json());
  app.get("/", (_: any, res: any): void => res.sendFile(`${pathToRootDirectory}/index.js`));
  app.get("/games/open/:category", (req: any, res: any): void => {
    res.json(rooms.getOpenRooms(req.params.category) || []);
    res.end();
  });
  app.get("/games/running/:category", (req: any, res: any): void => {
    res.json(rooms.getRunningRooms(req.params.category) || []);
    res.end();
  });
  app.get("/games/saved/:id", (req: any, res: any): void => {
    const id: any = req.params.id;
    backend.getGames(id)
      .then((game: Game[]) => res.json(rooms.matchRunningGames(game)))
      .catch(handleError(res));
  });
  app.get("/maps/type/:category", (req: any, res: any): void => {
    backend.getMaps(req.params.category)
      .then((maps) => res.json(maps))
      .catch(handleError(res));
  });
  app.post("/maps/save", (req: any, res: any): any => {
    const handle = handleError(res);
    const map: Map = req.body;
    if (isMap(map)) {
      return backend.saveMap(map)
        .then((savedMap: any) => res.json(savedMap))
        .catch(handleError(res));
    }
    handle(Error("Invalid map found in save attempt."));
  });
  app.post("/users/save", (req: any, res: any): any => {
    const handle = handleError(res);
    const user = req.body;
    if (isUser(user)) {
      return backend.saveUser(user)
        .then((response) => {
          res.json(response);
          clients.updateUser(response, user.id);
        })
        .catch(handle);
    }
    res.json(user);
    handle(Error("Invalid user found in attempt to save user."));
  });
  app.post("/users/oauth", (req: any, res: any): any => {
    const handle = handleError(res);
    const user = req.body;
    if (isUser(user)) {
      return backend.getUser(user.loginWebsite, user.id)
        .then((response) => {
          clients.updateUser(response, user.id);
          res.json(response);
        }).catch(handle);
    }
    handle(Error("Invalid user found in oauth attempt."));
  });
  app.post("/games/save", (req: any, res: any): any => {
    const handle = handleError(res);
    const game: Game = req.body.game;
    const user: User = req.body.user;
    let client: Client;
    if (isUser(user)) {
      if (isGame(game)) {
        client = clients.byId(user.id);
        if (isDefined(client) && isRoom(client.getRoom())) {
          return backend.saveGame(game)
            .then((receivedGame) => res.json(receivedGame))
            .catch(handle);
        }
        return handle(Error("Room not found in attempt to save game."));
      }
      return handle(Error("Invalid game found in attempt to save."));
    }
    handle(Error("Invalid user found in attempt to save game."));
  });
  app.post("/errors", (req: any, res: any): void => {
    const error: string = req.body;
    publish(browserErrorEventId, error);
    res.json(error);
    res.end();
  });
  app.delete("/games/remove/:id", (req: any, res: any): void => {
    backend.deleteGame(req.params.id)
      .then((removedGame) => res.json(removedGame))
      .catch(handleError(res));
  });
  app.delete("/maps/remove/:id", (req: any, res: any): void => {
    backend.deleteMap(req.params.id)
      .then((mapRemovalStatus) => res.json(mapRemovalStatus))
      .catch(handleError(res));
  });
  app.delete("/users/remove/:id", (req: any, res: any): void => {
    backend.deleteUser(req.params.id)
      .then((userRemovalStatus) => res.json(userRemovalStatus))
      .catch(handleError(res));
  });
  return server;
}
