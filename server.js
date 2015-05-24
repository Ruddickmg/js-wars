#!/bin/env node

var app = require('express')();
var http = require('http').Server(app);
var con = {}; // holds connection variables

con.ip = process.env.OPENSHIFT_NODEJS_IP;
con.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

if (typeof con.ip === "undefined") {
    //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
    //  allows us to run/test the app locally.
    console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
    con.ip = "127.0.0.1";
};

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

http.listen(con.port, con.ip, function(){
  console.log('listening on '+con.port+':'+con.ip);
});