import bodyParser = require("body-parser");
import cron = require("cron");
import express = require("express");
import http = require("http");
import socketIO =  require("socket.io");

import notifications, {PubSub} from "../tools/pubSub";

import gamePlaySocketListener from "../game/gamePlaySocketListener";
import gameSetupSocketListener from "../game/gameSetupSocketListener";
import aiController, {AiController} from "../game/users/ai/aiController";
import aiSocketListener from "../game/users/ai/aiSocketListener";
import time, {Time} from "../tools/calculations/time";
import compiler from "../tools/compiler";
import clientHandler, {ClientHandler} from "./clients/clients";
import connections, {Connections} from "./connections/connections";
import initializeRoutes from "./connections/routes";
import createSocketListener, {SocketListeners} from "./connections/sockets/listener";
import roomsController, {Rooms} from "./rooms/rooms";
import roomsSocketListener from "./rooms/roomsSocketListener";

const {subscribe}: PubSub = notifications();
const app: any = express();
const server: any = http.createServer(app);
const cronJob: any = cron.CronJob;
const connection: Connections = connections(process.env);
const periodOfTime: Time = time();
const defaultDirectory: string = "var/www";
const pathToRootDirectory: string = __dirname ? `${__dirname}/../../..` : defaultDirectory;
const staticFileDirectory: any = express.static(`${pathToRootDirectory}/public`);
const {ip, port, url} = connection.frontend();
const clients: ClientHandler = clientHandler();
const rooms: Rooms = roomsController(url);
const aiPlayers: AiController = aiController();
const socketListener: SocketListeners = createSocketListener();
const minutesToRememberDisconnectedSocket: number = 15;
const timeBetweenChecksOnSocketPool: string = "0 */20 * * * *";
const io = socketIO(server);
const handleDisconnectedSocketConnections = new cronJob({

  cronTime: timeBetweenChecksOnSocketPool,
  timeZone: "America/Los_Angeles",
  onTick() {
    clients.removeTimedOutDisconnections(
      periodOfTime.minutes(minutesToRememberDisconnectedSocket),
    );
  },
});
const pathFromRoot = (relativePath: string): string => `${pathToRootDirectory}${relativePath}`;
const esCompatibilityLevel: string = "env";
const relativePathToMain: string = "/public";
const relativePathToBrowserSideCode: string = "/javascript/src/browser";
const nameForInputFile: string = "main.js";
const nameForOutputFile: string = "index.js";
const pathToBrowserSideCode: string = pathFromRoot(relativePathToBrowserSideCode);
const pathToMain: string = pathFromRoot(relativePathToMain);
const pathToInputFile = `${pathToBrowserSideCode}/${nameForInputFile}`;
const pathToOutputFile = `${pathToMain}/${nameForOutputFile}`;

compiler(pathToInputFile)
// .tsify({target: "ES6", debug: true})
  .babelify({
    extensions: [".js"],
    plugins: [],
    presets: [esCompatibilityLevel],
  })
  .watchify()
  .compile(pathToOutputFile, {debug: true});

app.use(staticFileDirectory);
app.use(bodyParser.json());

socketListener.addListeners(
  roomsSocketListener(),
  aiSocketListener(clients, aiPlayers),
  gameSetupSocketListener(clients, rooms),
  gamePlaySocketListener(clients),
);

io.on("connection", socketListener.listenForSocketCommunication);

handleDisconnectedSocketConnections.start();

initializeRoutes(app, rooms, clients, pathToRootDirectory);

subscribe("error", (error: Error): any => console.log("\n" + error + "\n"));

server.listen(port, ip, () => console.log(`  - listening for requests @ ${ip}:${port}`));
