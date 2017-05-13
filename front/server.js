"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = require("body-parser");
const cron_1 = require("cron");
const express_1 = require("express");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const clients_1 = require("./src/clients/clients");
const connections_1 = require("./src/connections/connections");
const routes_1 = require("./src/connections/routes");
const listener_1 = require("./src/connections/sockets/listener");
const gamePlaySocketListener_1 = require("./src/game/gamePlaySocketListener");
const gameSetupSocketListener_1 = require("./src/game/gameSetupSocketListener");
const rooms_1 = require("./src/rooms/rooms");
const roomsSocketListener_1 = require("./src/rooms/roomsSocketListener");
const time_1 = require("./src/tools/calculations/time");
const compiler_1 = require("./src/tools/compiler");
const aiController_1 = require("./src/users/ai/aiController");
const aiSocketListener_1 = require("./src/users/ai/aiSocketListener");
const app = express_1.default();
const server = http_1.default.createServer(app);
const cronJob = cron_1.default.CronJob;
const connection = connections_1.default(process.env);
const periodOfTime = time_1.default();
const defaultDirectory = "var/www";
const pathToRootDirectory = __dirname || defaultDirectory;
const staticFileDirectory = express_1.default.static(`${pathToRootDirectory}/public`);
const { ip, port, url } = connection.frontend();
const clients = clients_1.default();
const aiPlayers = aiController_1.default();
const rooms = rooms_1.default(url);
const socketListener = listener_1.default();
const minutesToRememberDisconnectedSocket = 15;
const timeBetweenChecksOnSocketPool = "0 */20 * * * *";
const io = socket_io_1.default(server);
const handleDisconnectedSocketConnections = new cronJob({
    cronTime: timeBetweenChecksOnSocketPool,
    timeZone: "America/Los_Angeles",
    onTick() {
        clients.removeTimedOutDisconnections(periodOfTime.minutes(minutesToRememberDisconnectedSocket));
    },
});
const pathFromRoot = (relativePath) => `${pathToRootDirectory}${relativePath}`;
const esCompatibilityLevel = "env";
const relativePathToMain = "/public/js";
const relativePathToNode = "/node";
const nameForInputFile = "main.js";
const nameForOutputFile = "index.js";
const pathToNode = pathFromRoot(relativePathToNode);
const pathToMain = pathFromRoot(relativePathToMain);
const pathToInputFile = `${pathToNode}/${nameForInputFile}`;
const pathToOutputFile = `${pathToMain}/${nameForOutputFile}`;
compiler_1.default(pathToInputFile)
    .tsify({ target: "ES6" })
    .babelify({
    extensions: [".js", ".ts"],
    plugins: [],
    presets: [esCompatibilityLevel],
}).compile(pathToOutputFile);
app.use(staticFileDirectory);
app.use(body_parser_1.default.json());
socketListener.addListeners(roomsSocketListener_1.default(clients, rooms, aiPlayers), aiSocketListener_1.default(clients, aiPlayers), gameSetupSocketListener_1.default(clients, rooms), gamePlaySocketListener_1.default(clients, aiPlayers));
io.on("connection", socketListener.listenForSocketCommunication);
handleDisconnectedSocketConnections.start();
routes_1.default(app, rooms, clients, pathToRootDirectory);
server.listen(port, ip, () => console.log(`  - listening for requests @ ${ip}:${port}`));
//# sourceMappingURL=server.js.map