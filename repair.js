var lib=require('./lib');
var async=require('async');
var fs = require('fs');
var http = require('http');
var io=require('socket.io-client');

var localFile=__dirname+'/public/'+process.argv[2];
var remoteFile=process.argv[3];
var remoteHost=process.argv[4];

var minDownload=5*1000*1000;// 5MB 5000000
var splits=50;
var socket = io.connect('http://'+remoteHost);


var download=function(start,end, callback){
    var size=end-start;

    var file = fs.createWriteStream(localFile,{
        flags: 'r+',
        defaultEncoding: 'binary',
        fd: null,
        autoClose: true,
        start:start
    });

    http.request({
        host:remoteHost.split(':')[0],
        port:remoteHost.split(':')[1],
        method:'GET',
        path:'/'+remoteFile,
        headers:{
            Range:'bytes='+start+'-'+end
        },
    }, function(response) {
        response.pipe(file);

        response.on('end',function () {
            file.end();
            callback();
        });
    }).end();

};
//0[35][46]
var checkBunch=function (id,from,to,cbb) {
    var size=to-from;
    var block=Math.ceil(size/splits);



    var q = async.queue(function(task, callback) {
        // if (task<35)
        //    return callback();
        var posStart=from+(block*task);
        var posEnd=from+(block*(task+1));
        var blockId=id+'['+task+']';

        lib.md5(localFile,posStart,posEnd,function (err,hash) {
            // check server for this hash...
            socket.emit('check',remoteFile,posStart,posEnd,function (err, remote) {
                if(err) {
                    callback();
                    console.error(err);
                    return;
                }
                if (remote!==hash){
                    var mismatch=(posEnd-posStart);
                    console.log(blockId+' '+(mismatch/(1000*1000))+ "mb mismatch local:"+hash+ "remote:"+remote);

                    if (mismatch<=minDownload){
                        // repair this block..
                        console.log(blockId+' Downloading '+((mismatch/(1000*1000)))+'mb');
                        download(posStart,posEnd, callback);
                    } else {
                        console.log(blockId+' divide ');
                        checkBunch(blockId,posStart,posEnd,callback);
                    }
                } else {
                    console.log(blockId+' Match');
                    callback();
                }
            });
        });


    }, 1);

    q.drain = function() {
        console.log(id+'all items have been processed');
        cbb();
    };
    for (var i=0;i<splits;i++){
        q.push(i);
    }
};


socket.on('connect', function () {
    // socket connected
    console.log('socket connected');
    lib.stat(localFile,function (err,stat) {
        if (err)
            return console.error(err);

        socket.emit('stat',remoteFile,function (err, remoteStat) {
            if(err)
                return console.error(err);
            if (remoteStat.size!==stat.size){
                console.error('size mismatch local:'+stat.size+' remote:'+remoteStat.size);
                return;
            }
            console.log('total size: '+stat.size);
            checkBunch(0,0,stat.size,function () {
                console.log('all done');
            });
        });
    });
});




