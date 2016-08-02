#!/bin/env node

// set project root
if(!__dirname) __dirname = '/var/www';

/* ----------------------------------------------------------------------------------------------------------*\
    setup express application
\* ----------------------------------------------------------------------------------------------------------*/

var express = require('express');
var application = express();
var server = require('http').createServer(application);
var bp = require('body-parser');
var cron = require('cron').CronJob;
var browserify = require('./node/compile.js');

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
    ip: process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '127.0.0.1'
};

application.use(express.static(__dirname + '/public'));

/* ----------------------------------------------------------------------------------------------------------*\
    set up and handle socket io
\* ----------------------------------------------------------------------------------------------------------*/

var minutes = function (minutes) { return 60000 * minutes; };

// set up instance of socket io with server
var io = require ('socket.io') (server);

// get code for socket communication
var socket = require('./node/sockets.js');

var flush = new cron('0 */20 * * * *', function() {socket.flush(minutes(15));}, null, false, 'America/Los_Angeles');

// anytime someone connects to the server pass the watch method as the callback function for the socket handler
io.on('connection', socket.watch);

flush.start();

/* ----------------------------------------------------------------------------------------------------------*\
    set up and handle ajaj calls to the database
\* ----------------------------------------------------------------------------------------------------------*/

var backend = require('./node/backend.js');
application.use(bp.json());
application.get('/', function (req, res) {res.sendFile(__dirname + '/index.html');});
application.get('/maps/type/:category', function (req, res){backend(res).get_maps(req.params.category, res);});
application.get('/maps/select/:id', function (req, res){backend(res).get_map(req.params.id, res);});
application.post('/maps/save', function (req, res){backend(res).save_map(req.body, res);});
application.get ('/games/:category', function (req, res) {
    res.json(socket.rooms(req.params.category) || []);
    res.end();
});

/* ----------------------------------------------------------------------------------------------------------*\
    listen for requests to server
\* ----------------------------------------------------------------------------------------------------------*/

server.listen(con.port, con.ip, function(){console.log('  - listening for requests @ '+con.port+':'+con.ip);});