#!/bin/env node

var express = require('express')();
var http = require('http').Server(express);
var io = require('socket.io')(http);
var con = {}; // holds connection variables

con.ip = process.env.OPENSHIFT_NODEJS_IP;
con.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

if (typeof con.ip === "undefined") {
    //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
    //  allows us to run/test the express locally.
    console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
    con.ip = "127.0.0.1";
};

express.use(express.static('public'));

express.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(con.port, con.ip, function(){
  console.log('listening on '+con.port+':'+con.ip);
});