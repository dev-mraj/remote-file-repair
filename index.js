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




/*app.post('/',function (req, res) {

    var parsed = url.parse(req.body.url);
    var fileName=path.basename(parsed.pathname);
    fileName=fileName?fileName:Math.random()+'.oct';
    fileName=__dirname+'/public/'+fileName;
    var progressFile=fileName+'.progress.json';
    var errorFile=fileName+'.progress.error';


    var download = wget.download(req.body.url, fileName);
    download.on('error', function(err) {
        fs.writeFileSync(errorFile,err.message);
    });
    download.on('start', function(fileSize) {
        fs.writeFileSync(progressFile,JSON.stringify({
            size:fileSize,
            progress:0
        }));
    });
    download.on('end', function(output) {
        debugger;
        console.log(output);
    });
    download.on('progress', function(progress) {

        var data=JSON.parse(fs.readFileSync(progressFile));
        data.progress=Math.round(progress*100);

        fs.writeFileSync(progressFile,JSON.stringify(data));
    });

    setTimeout(function () {
        res.redirect('/');
    },3000);
});

app.get('/',function (req, res) {
    res.set('Content-Type', 'text/html');
    res.write(' <form method="post" action="/" >');
    res.write('  <input type="text" name="url">');
    res.write('  <input type="submit" value="Download">');
    res.write('</form>');
    res.write('<h3>Files:</h3>');

    var files=fs.readdirSync(__dirname+'/public');

    for(var i=0;i<files.length;i++){
        var name=files[i];
        if (name=='.gitignore') continue;

        if(fs.existsSync(name+'.progress.error')) {
            var data=fs.readFileSync(name+'.progress.error');
            res.write('<i>'+name+'</i> Error: '+data+'<br/>');
        } else if(fs.existsSync(name+'.progress.json')) {
            var data=JSON.parse(fs.readFileSync(name+'.progress.json'));
            res.write('<i>'+name+'</i> Progress: '+data.progress+'%  Size:'+data.size+'   <br/>');
        } else if(name.indexOf('.progress')<0){
            res.write(name+'<br/>');
            res.write('[<a href="http://23.92.65.221/mv/<?=encode_uri(basename($item))?>">DOWNLOAD</a>]');
            res.write('&nbsp;');
            res.write('[<a href="http://s.dev.tagove.com/proxy/http/23.92.65.221/mv/<?=encode_uri(basename($item))?>">PROXY</a>]<br/><br/>');
        }
    }
    res.end();
});*/

http.listen(3561, function(){
    console.log('listening on *:3561');
});