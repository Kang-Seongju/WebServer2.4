var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var util = require('util');
var xml2js = require('xml2js');
var url = require('url');
var xmlbuilder = require('xmlbuilder');
var ip = require('ip');
const crypto = require('crypto');
var fileStreamRotator = require('file-stream-rotator');
var merge = require('merge');
var https = require('https');
var cbor = require('cbor');
var qs = require("querystring");
var app = express();

var host = "128.134.65.120";
var aeName = "kwu-hub"
var gSocket;

var httpServer = http.createServer(app).listen({port:80, agent: false}, function(req,res){
      console.log('Web server (' + ip.address() + ') running at ' + 80 + ' port');
});
// upgrade http server to socket.io server
var io = require('socket.io').listen(httpServer);

io.sockets.on('connection', function(socket){
    gSocket = socket;
    socket.on('createCin', function(data) {
        var msg = data.text.split(" ");
        createCin(msg[0], msg[1]);
    });
    socket.on('getResource', function(data) {
        getCntInformation(function(cntList){
            console.log(cntList);
        });
    });
    socket.on('Check', function(data) {
            console.log(data);
    });
});


app.use(bodyParser.urlencoded({extended:false}));
app.use('/', express.static(__dirname));

app.get('/', function(req, res){

    var pathname = url.parse(req.url).pathname;

    fs.readFile('main.html', function(error, data){
        if(error)
            console.log(error);
        else{
            res.writeHead(200, {'Content-Type':'text/html'});
            res.end(data);
        }
    });
});

app.post('/', function(req, res){

    var pathname = url.parse(req.url).pathname;

    var target = req.body.target;
    var value = req.body.value;

    console.log('========================POST EVENT==================');
    console.log('Target: [' + target + '] ' + 'Value: [' + value + ']');
    gSocket.send('Log:::Target: [' + target + '] ' + 'Value: [' + value + ']');

});

function createCin(path, value){
    var options = {
        "method": "POST",
        "hostname": host,
        "port": "7579",
        "path": path,
        "headers": {
            "Accept": "application/xml",
            "X-M2M-RI": "12345",
            "X-M2M-Origin": "Web-server",
            "Content-Type": "application/vnd.onem2m-res+xml; ty=4",
        }
    };

    var req = http.request(options, function (res) {
        // if(res.statusCode == 201 || res.statusCode == 409)
        //     ;
        // else
        //     ;
    });

    var requestBody = 
        "<m2m:cin\n" +
            "xmlns:m2m=\"http://www.onem2m.org/xml/protocols\"\n" +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
            "<con>" + value + "</con>\n" +
        "</m2m:cin>";            
    req.write(requestBody);
    req.end();
}

function getCntInformation(callback) {

    var cntList = '';
    var options = {
        "method": "GET",
        "hostname": host,
        "port": "7579",
        "path": "/Mobius?fu=1&amp;ty=3",
        "headers": {
            "Accept": "application/xml",
            "X-M2M-RI": "12345",
            "X-M2M-Origin": "Web-server",
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks).toString();  
            var list = body.split("Mobius/" + aeName + "/");
            var device = [];
            var max = 0;
            var cur = 0;

            list.forEach(function(item, index) {
                var deviceList = list[index].split("/");
                
                if(deviceList.length < 3){
                    if(!deviceList[deviceList.length-1].includes('rtvt') && !deviceList[deviceList.length-1].includes('4-')){
                        
                        if(deviceList.length == 1 && deviceList[0].includes('Sensor')){
                            max++;
                            getCinLatest(deviceList[0].trim(), function(res){
                                cur++;
                                // device.push({root: deviceList[0].trim(), value:res});
                                device.push({root: deviceList[0].trim(), leaf:'-@-', value:res});
                                if(max == cur){
                                    console.log(device);
                                    convertMsgForm(device);
                                }
                            });
                        }
                        else if(deviceList.length == 2){
                            max++;
                            getCinLatest(deviceList[0].trim() + '/' + deviceList[1].trim(), function(res){
                                cur++;
                                device.push({root: deviceList[0].trim(), leaf:deviceList[1].trim(), value:res});
                                if(max == cur){
                                    console.log(device);
                                    convertMsgForm(device);
                                }
                            });
                        }
                    }
                }
            });


        });
    });

    req.end();  
}

function convertMsgForm(device) {
    var rsc = [];    
    var idx = 0;

    for(idx = 0; idx<device.length; idx++){
        var jdx = isContain(rsc, device[idx].root);
        if(jdx){
            rsc[jdx].leaf += ('&' + device[idx].leaf);
            rsc[jdx].value += ('&' + device[idx].value);
        }
        else
            rsc.push({root: device[idx].root, leaf:device[idx].leaf, value:device[idx].value});
    }

    /*
    * -@- : empty resource
    * $$ : root, leaf bound
    * ## : leaf, value bound
    * %% : each element bound 
    */
    console.log('=============');
    console.log(rsc); 
    console.log('-------------');
    var sendMsg = ''

    for(idx = 0;idx<rsc.length;idx++){
        sendMsg += rsc[idx].root;
        sendMsg += '$$';
        sendMsg += rsc[idx].leaf;
        sendMsg += '##';
        sendMsg += rsc[idx].value;
        sendMsg += '@@';
    }

    gSocket.send('View:::' + sendMsg);   
    console.log(sendMsg);
}

function isContain(arr, target) {
    var idx;
    for(idx = 0; idx<arr.length;idx++){
        if(arr[idx].root == target)
            return idx;
    }
    return 0;
}

function getCinLatest(target, callback){
    var cntList = '';
    var options = {
        "method": "GET",
        "hostname": host,
        "port": "7579",
        "path": "/Mobius/" + aeName + '/' + target + '/latest',
        "headers": {
            "Accept": "application/xml",
            "X-M2M-RI": "12345",
            "X-M2M-Origin": "Web-server",
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks).toString();  
            var parser = new xml2js.Parser();
            parser.parseString(body, function(err,result){
                try{
                    callback(result['m2m:cin']['con']);
                    // console.log(result);
                    // callback(JSON.stringify(result));
                }
                catch(exception){
                    callback('-@-');
                }
            });
        });
    });

    req.end();     
}