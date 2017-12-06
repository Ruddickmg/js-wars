import cron = require("cron");
import socketIO = require("socket.io");
import gamePlaySocketListener from "../game/gamePlaySocketListener";
import gameSetupSocketListener from "../game/gameSetupSocketListener";
import aiController, {AiController} from "../game/users/ai/aiController";
import aiSocketListener from "../game/users/ai/aiSocketListener";
import time, {Time} from "../tools/calculations/time";
import compiler from "../tools/compiler";
import notifications, {PubSub} from "../tools/pubSub";
import clientHandler, {ClientHandler} from "./clients/clients";
import initBackend, {Backend} from "./connections/backend";
import connections, {Connections} from "./connections/connections";
import initializeDatabase from "./connections/initializeDatabase";
import initializeServer from "./connections/server";
import createSocketListener, {SocketListeners} from "./connections/sockets/listener";
import roomsController, {Rooms} from "./rooms/rooms";
import roomsSocketListener from "./rooms/roomsSocketListener";

const esCompatibilityLevel: string = "env";
const defaultDirectory: string = "/var/www";
const relativePathToMain: string = "public";
const relativePathToBrowserCode: string = "javascript/src/browser";
const nameForInputFile: string = "main.js";
const nameForOutputFile: string = "index.js";
const errorEventId: string = "error";
const {publish, subscribe}: PubSub = notifications();
const cronJob: any = cron.CronJob;
const connection: Connections = connections(process.env);
const periodOfTime: Time = time();
const pathToRootDirectory: string = __dirname ? `${__dirname}/../../../` : defaultDirectory;
const {ip, port} = connection.frontend();
const {url} = connection.backend();
const backend: Backend = initBackend(url);
const clients: ClientHandler = clientHandler();
const rooms: Rooms = roomsController(url);
const aiPlayers: AiController = aiController();
const socketListener: SocketListeners = createSocketListener();
const minutesToRememberDisconnectedSocket: number = 15;
const timeBetweenChecksOnSocketPool: string = "0 */20 * * * *";
const pathFromRoot = (relativePath: string): string => `${pathToRootDirectory}${relativePath}`;
const pathToBrowserSideCode: string = pathFromRoot(relativePathToBrowserCode);
const pathToMain: string = pathFromRoot(relativePathToMain);
const pathToInputFile = `${pathToBrowserSideCode}/${nameForInputFile}`;
const pathToOutputFile = `${pathToMain}/${nameForOutputFile}`;
const server: any = initializeServer(pathToRootDirectory);
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
compiler(pathToInputFile)
// .tsify({target: "ES6", debug: true})
  .babelify({
    extensions: [".js"],
    plugins: [],
    presets: [esCompatibilityLevel],
  })
  .watchify()
  .compile(pathToOutputFile, {debug: true});
socketListener.addListeners(
  roomsSocketListener(),
  aiSocketListener(clients, aiPlayers),
  gameSetupSocketListener(clients, rooms),
  gamePlaySocketListener(clients),
);
io.on("connection", socketListener.listenForSocketCommunication);
handleDisconnectedSocketConnections.start();
subscribe(errorEventId, (error: Error): any => console.log("\n" + error + "\n"));
initializeDatabase(backend)
  .then(() => server.listen(port, ip, () => console.log(`  - listening for requests @ ${ip}:${port}`)))
  .catch((error: Error) => publish(errorEventId, error));
