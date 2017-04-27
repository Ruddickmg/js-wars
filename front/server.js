/* eslint-disable no-undef,no-console */

"use strict";

const
    defaultDirectory = "/var/www",
    pathToRootDirectory = __dirname || defaultDirectory,

    express = require("express"),
    http = require("http"),
    bodyParser = require("body-parser"),
    cronJob = require("cron").CronJob,
    connections = require("./node/connections/connections.js")(process.env),
    initializeRoutes = require("./node/connections/routes.js"),
    compiler = require("./node/tools/compiler.js"),
    timeKeeper = require("./node/tools/calculations/time.js"),

    app = express(),
    time = timeKeeper(),
    server = http.createServer(app),
    staticFileDirectory = express.static(`${pathToRootDirectory}/public`),
    {ip, port} = connections.frontend(),

    minutesToRememberDisconnectedSocket = 15,
    timeBetweenChecksOnSocketPool = "0 */20 * * * *",
    io = require ("socket.io") (server),
    sockets = require("./node/connections/sockets/sockets.js") (io),
    handleDisconnectedSocketConnections = new cronJob({

        cronTime: timeBetweenChecksOnSocketPool,
        timeZone: "America/Los_Angeles",
        onTick() {

            sockets.removeDisconnected(time.minutes(minutesToRememberDisconnectedSocket))
        }
    }),

    esCompatibilityLevel = "env",
    relativePathToMain = "/public/js",
    nameForInputFile = "main.js",
    nameForOutputFile = "js-wars.js",
    pathToMain = `${pathToRootDirectory}${relativePathToMain}`;

compiler(pathToMain, nameForInputFile)
    .watchify()
    .babelify({
        presets: [esCompatibilityLevel],
        plugins: []
    })
    .compile(nameForOutputFile);

app.use(staticFileDirectory);
app.use(bodyParser.json());

io.on("connection", sockets.listenForSocketCommunication);

handleDisconnectedSocketConnections.start();

initializeRoutes(app, sockets, pathToRootDirectory);

server.listen(port, ip, () => console.log(`  - listening for requests @ ${ip}:${port}`));