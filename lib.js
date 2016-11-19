var fs=require('fs');
var crypto = require('crypto');
var http = require('http');
var url = require('url');


module.exports={

    /*request:function (host,port,url, data, cb) {


        var data=JSON.stringify(JSON.stringify(data));

        var req=http.request({
            hostname: host,
            port:parseInt(port),
            method:'POST',
            path: '/'+url,
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': Buffer.byteLength(data)
            }
        }, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                try {
                    var data=JSON.parse(str);
                    cb(null,data);
                } catch (e){
                    cb("server error: "+str);
                }
            });
        });

        req.on('error',function (err) {
            cb(err);
        });
        req.write(data);
        req.end();
    },
    download:function (url,file,path) {

    },*/
    /*open:function (path,cb) {
        fs.open(path,'r',function (err, fd) {
            if (err)
                return cb(err);
            fs.stat(path,function (err, stats) {
                if (err)
                    return cb(err);
                cb(null,fd, stats);
            });
        });
    },*/
    stat:function (path,cb) {
        fs.stat(path,function (err, stats) {
            if (err)
                return cb(err);
            cb(null,stats);
        });
    },

    md5:function (path,from,to,cb) {
        var fstream=fs.createReadStream(path, {
            flags:'r',
            start: from,
            end: to
        });
        var hash = crypto.createHash('md5');
        hash.setEncoding('hex');
        fstream.on('end', function() {
            hash.end();
            cb(null, hash.read()); // the desired sha1sum
        });
        fstream.pipe(hash);
    },

};