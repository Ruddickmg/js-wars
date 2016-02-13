#!/bin/env node

// set project root
if(!__dirname) __dirname = '/var/www';

/* ----------------------------------------------------------------------------------------------------------*\
    setup express application
\* ----------------------------------------------------------------------------------------------------------*/

var express = require('express');
var request = require('request');
var application = express();
var server = require('http').createServer(application);
var bp = require('body-parser');

/* ----------------------------------------------------------------------------------------------------------*\
    impliment browserify and uglify or watchify depending on production or development
\* ----------------------------------------------------------------------------------------------------------*/

var watchAndCompile = require('./node/compile.js');
watchAndCompile(__dirname)(process.env.DEV);

/* ----------------------------------------------------------------------------------------------------------*\
    set up and handle socket io
\* ----------------------------------------------------------------------------------------------------------*/

var io = require('socket.io')(server);
var socketHandler = require('./node/sockets.js');
io.on('connection', socketHandler);

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
    set up and handle ajaj calls to the database
\* ----------------------------------------------------------------------------------------------------------*/

var backend = require('./node/backend.js');
application.use(bp.json());
application.get('/', function (req, res) {res.sendFile(__dirname + '/index.html');});
application.get('/maps/type/:category', function (req, res){backend.get_maps(req.params.category, res);});
application.get('/maps/select/:id', function (req, res){backend.get_map(req.params.id, res);});
application.post('/maps/save', function(req, res){backend.save_map(req.body, res);});
application.get('/games/:category', function (req, res){
    var games = rooms[req.params.category];
    var response = games ? games : [];
    res.json(response);
    res.end();
});
application.use(require('browser-logger')());

/* ----------------------------------------------------------------------------------------------------------*\
    listen for requests to server
\* ----------------------------------------------------------------------------------------------------------*/

server.listen(con.port, con.ip, function(){console.log('  - listening for requests @ '+con.port+':'+con.ip);});