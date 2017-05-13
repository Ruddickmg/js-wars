import bodyParser from "body-parser";
import cron from "cron";
import express from "express";
import http from "http";
import socketIO from "socket.io";
import {ClientHandler, default as clientHandler} from "./src/clients/clients";
import {Connections, default as connections} from "./src/connections/connections";
import initializeRoutes from "./src/connections/routes";
import {default as createSocketListener, SocketListeners} from "./src/connections/sockets/listener";
import gamePlaySocketListener from "./src/game/gamePlaySocketListener";
import gameSetupSocketListener from "./src/game/gameSetupSocketListener";
import {default as roomsController, Rooms} from "./src/rooms/rooms";
import roomsSocketListener from "./src/rooms/roomsSocketListener";
import {default as time, Time} from "./src/tools/calculations/time";
import compiler from "./src/tools/compiler";
import {AiController, default as aiController} from "./src/users/ai/aiController";
import aiSocketListener from "./src/users/ai/aiSocketListener";

const app: any = express();
const server: any = http.createServer(app);
const cronJob: any = cron.CronJob;
const connection: Connections = connections(process.env);
const periodOfTime: Time = time();
const defaultDirectory: string = "var/www";
const pathToRootDirectory: string = __dirname || defaultDirectory;
const staticFileDirectory: any = express.static(`${pathToRootDirectory}/public`);
const {ip, port, url} = connection.frontend();
const clients: ClientHandler = clientHandler();
const aiPlayers: AiController = aiController();
const rooms: Rooms = roomsController(url);
const socketListener: SocketListeners = createSocketListener();
const minutesToRememberDisconnectedSocket: number = 15;
const timeBetweenChecksOnSocketPool: string = "0 */20 * * * *";
const io = socketIO(server);
const handleDisconnectedSocketConnections = new cronJob({

    cronTime: timeBetweenChecksOnSocketPool,
    timeZone: "America/Los_Angeles",
    onTick() {
        clients.removeTimedOutDisconnections(periodOfTime.minutes(minutesToRememberDisconnectedSocket))
    },
});
const pathFromRoot = (relativePath: string): string => `${pathToRootDirectory}${relativePath}`;
const esCompatibilityLevel: string = "env";
const relativePathToMain: string = "/public/js";
const relativePathToNode: string = "/node";
const nameForInputFile: string = "main.js";
const nameForOutputFile: string = "index.js";
const pathToNode: string = pathFromRoot(relativePathToNode);
const pathToMain: string = pathFromRoot(relativePathToMain);
const pathToInputFile = `${pathToNode}/${nameForInputFile}`;
const pathToOutputFile = `${pathToMain}/${nameForOutputFile}`;

compiler(pathToInputFile)
    .tsify({target: "ES6"})
    .babelify({
        extensions: [".js", ".ts"],
        plugins: [],
        presets: [esCompatibilityLevel],
    }).compile(pathToOutputFile);

app.use(staticFileDirectory);
app.use(bodyParser.json());

socketListener.addListeners(
    roomsSocketListener(clients, rooms, aiPlayers),
    aiSocketListener(clients, aiPlayers),
    gameSetupSocketListener(clients, rooms),
    gamePlaySocketListener(clients, aiPlayers),
);

io.on("connection", socketListener.listenForSocketCommunication);

handleDisconnectedSocketConnections.start();

initializeRoutes(app, rooms, clients, pathToRootDirectory);

server.listen(port, ip, () => console.log(`  - listening for requests @ ${ip}:${port}`));
