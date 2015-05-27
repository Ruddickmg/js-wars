#!/bin/env node
var express = require('express');
var application = express();
var server = require('http').Server(application);
var io = require('socket.io')(server);
var con = {}; // holds connection variables

con.ip = process.env.OPENSHIFT_NODEJS_IP;
con.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

if (typeof con.ip === "undefined") {
    //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
    //  allows us to run/test the application locally.
    console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
    con.ip = "127.0.0.1";
};

application.use(express.static(__dirname + '/public'));

application.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

application.use(require('browser-logger')());

server.listen(con.port, con.ip, function(){
  console.log('listening on '+con.port+':'+con.ip);
});

io.on('connection', function(socket){
  console.log('a user connected');
});

