#!/bin/env node

// set project root
if(!__dirname) __dirname = "/var/www";

/* ----------------------------------------------------------------------------------------------------------*\
    setup express application
\* ----------------------------------------------------------------------------------------------------------*/

var express = require("express");
var application = express();
var server = require("http").createServer(application);
var bp = require("body-parser");
var cron = require("cron").CronJob;
var browserify = require("./node/compile.js");

/* ----------------------------------------------------------------------------------------------------------*\
    handle browserify stuff
\* ----------------------------------------------------------------------------------------------------------*/

browserify = browserify(__dirname);
browserify(true);

/* ----------------------------------------------------------------------------------------------------------*\
    set up server/connection variables and paths to files to be served
\* ----------------------------------------------------------------------------------------------------------*/


// connection variables
var con = {
    port: process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080,
    ip: process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1"
};

application.use(express.static(__dirname + "/public"));

/* ----------------------------------------------------------------------------------------------------------*\
    set up and handle socket io
\* ----------------------------------------------------------------------------------------------------------*/

var minutes = function (minutes) { return 60000 * minutes; };

// set up instance of socket io with server
var io = require ("socket.io") (server);

// get controller for socket communication and initialize it
var sockets = require("./node/sockets.js") (io);

var flush = new cron("0 */20 * * * *", function() {sockets.flush(minutes(15));}, null, false, "America/Los_Angeles");

// anytime someone connects to the server pass the watch method as the callback function for the socket handler
io.on("connection", sockets.watch);

flush.start();

/* ----------------------------------------------------------------------------------------------------------*\
    set up and handle ajaj calls to the database
\* ----------------------------------------------------------------------------------------------------------*/

var backend = require("./node/backend.js");
application.use(bp.json());
application.post("/maps/save", function (req, res) {backend(res).save_map(req.body, res);});
application.post ("/users/save", function (req, res) {
    // reminder
    console.log("handle validation etc before going live");

    // save the user and update its id from the database
    backend(res).callback(function (response) {
        sockets.updateUser(response, req.params.id);
    }).save_user(req.body, res);
};
application.post ("/games/save", function (req, res) {backend(res).save_game(req.body, res);};
application.get('/', function (req, res) {res.sendFile(__dirname + "/index.html");});
application.get("/maps/type/:category", function (req, res){backend(res).get_maps(req.params.category, res);});
application.get ("/games/open/:category", function (req, res) {
    res.json(sockets.open(req.params.category) || []);
    res.end();
});

application.get();
application.get ("/games/running/:category", function (req, res) {
    res.json(sockets.running(req.params.category) || []);
    res.end();
});

/* ----------------------------------------------------------------------------------------------------------*\
    listen for requests to server
\* ----------------------------------------------------------------------------------------------------------*/

server.listen(con.port, con.ip, function(){console.log("  - listening for requests @ "+con.port+":"+con.ip);});