var express = require('express');
var app= express();
var fs=require('fs');
var http = require('http').Server(app);
var lib=require('./lib');
var bodyParser = require('body-parser')
var wget = require('wget-improved');
var url = require("url");
var path = require("path");


app.use(express.static('public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

var filePath=function (file) {
    return __dirname+'/public/'+file.replace('../','/').replace('/..','/');
};



var io =require('socket.io').listen(http);
io.on('connection', function(socket) {

    socket.on('stat',function (file, cb) {
        console.log('stat');
        lib.stat(filePath(file),function (err,stat) {
            if (err) {
                cb(err.message);
                return ;
            }
            cb(null, stat);
        });
    });


    socket.on('check',function (file,from,to, cb) {
        console.log('check');
        lib.md5(filePath(file),from, to,cb);
    });

});


http.listen(3561, function(){
    console.log('listening on *:3561');
});