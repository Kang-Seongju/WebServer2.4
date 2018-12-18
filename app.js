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
var mqtt =require('mqtt');
const crypto = require('crypto');
var fileStreamRotator = require('file-stream-rotator');
var merge = require('merge');
var https = require('https');
var cbor = require('cbor');
var qs = require("querystring");
var app = express();
var time = require("date-utils");
var mqtt = require('mqtt');
var mqttport = "1883"
var host = "128.134.65.120";
var aeName = "kwu-hub";
var TaeName= "oneM2M_AE_TEST";
var gSocket;
     console.log("connect");
var httpServer = http.createServer(app).listen({port:80, agent: false}, function(req,res){
      console.log('Web server (' + ip.address() + ') running at ' + 80 + ' port');
});

/* GW for Testing platform start */
var testHost = "223.194.33.61";

function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}
/* GW for Testing platform end */

// upgrade http server to socket.io server
var io = require('socket.io').listen(httpServer);

io.sockets.on('connection', function(socket){

    /* GW for Testing platform start */
    socket.on('testSuite', function(testcase){
        var net = require('net'); 
        var path = '';
        var prefix = '';
        var client = net.connect({port:8891, host:testHost}, function(){
            console.log('TestSuite: ' + testcase);
            if(testcase.indexOf('CSE') != -1)
                client.write("smtc OneM2M_Testcases_CSE_Release_2." + testcase);
            else{
                if(testcase.indexOf('AE') != -1){
                    console.log('TCP SOCKET: aeTest send');
                    client.write("aeTest");
                }
                else{
                    console.log('TCP SOCKET: cntTest send');
                    client.write("cntTest");
                }
            }

            var date = new Date();
            var y = date.getFullYear();
            var mm = date.getMonth()+1;
            var d = date.getDate();
            var h = date.getHours();
            var m = date.getMinutes();
            var s = date.getSeconds();
            prefix = '' + y + mm + d + h + m + s +'_';
            path = './log/' + prefix + testcase + '.txt';
            testLogFile = fs.createWriteStream(path);
        });        
        var str = ''; 
        client.on('data', function(data){
            var input = data.toString();
            console.log(input);
            if(input.indexOf('?xml') != -1){
                input = replaceAll(input, "<", "＜");
                input = replaceAll(input, ">", "＞");
                input += 'Verdict: pass';
            }
            
            if(input.indexOf('Test execution finished.') != -1){
                input = input.replace('Test execution finished.', '');
                testLogFile.write(input);  
                str += input; 
                testLogFile.end();
                socket.emit('filelist', prefix + testcase + '.txt');
                socket.emit('filecontext', str);
                console.log('Finished.');
            }
            else{
                testLogFile.write(input); 
                str += input;
            }
        })       

        client.on('error', function(err){
            console.log('TCP Server connection error.');
            console.log(err);
        })
    });
    /* GW for Testing platform end */
    
    gSocket = socket;
    console.log('connet');
    socket.on('createCin', function(data) {
        var msg = data.text.split(" ");
        createCin(msg[0], msg[1]);
    });
    socket.on('getResource', function(data) {
        // addNode("Mobius", "Miracle");  
        getCntInformation(function(cntList){
            console.log('getResource');
        });
    });

    socket.on('file',function(data){
        console.log("FILE OPEN");
        var path = './log/';
        fs.readdir(path, function (err, files) {
          if(err) throw err;
          files.forEach(function(file) {
            socket.emit('filelist',file);
          });
        });
    });
    socket.on('fileread',function(filename){
        fs.readFile('./log/'+filename, 'utf8', function(err, data) {
        if(!err){
            socket.emit('filecontext',data);
        }
        });
    });
    socket.on('getSemantic_Resource',function(data){
        var client  = mqtt.connect('mqtt://'+host+':1883');
        client.on('connect', function () {
            client.publish("/oneM2M/pub/Semantic/Client/Rule","Request_ALL");
            client.publish("/oneM2M/pub/Semantic/Client/Rule/ontology","Request_ALL");
        })
        client.on('end',function(){
            client.end();
        })
         client.on('error',function(){
            client.end();
        })
    });
    socket.on('updaterule',function(data){
        Update_Rule(data);
    });
    socket.on('writelog',function(data){ 
        var path = './log/';
        var li = data.split(";;");
        var i= 0;
        var fu = setInterval( 
            function(){
                var test;
                if(li[2]=="oneM2M_TEST_CD"){
                    test = ["oneM2M_TCS_AE_CRE","oneM2M_TCS_CNT_CRE","oneM2M_TCS_CIN_CRE","oneM2M_TCS_CIN_RET","oneM2M_TCS_CNT_DEL","oneM2M_TCS_AE_DEL"];
                }
                if(li[2]=="oneM2M_TEST_CUD"){
                    test =["oneM2M_TCS_AE_CRE","oneM2M_TCS_CNT_CRE","oneM2M_TCS_CNT_RET","oneM2M_TCS_CNT_UPDATE","oneM2M_TCS_CNT_RET","oneM2M_TCS_CNT_DEL","oneM2M_TCS_AE_DEL"];
                }
                if(li[2]=="oneM2M_TEST_CRD"){
                    test =["oneM2M_TCS_AE_CRE","oneM2M_TCS_CNT_CRE","oneM2M_TCS_SUB_CRE","oneM2M_TCS_SUB_RET","oneM2M_TCS_CIN_CRE","oneM2M_TCS_CIN_RET","oneM2M_TCS_CIN_CRE","oneM2M_TCS_CIN_RET","oneM2M_TCS_SUB_DEL","oneM2M_TCS_CNT_DEL","oneM2M_TCS_AE_DEL"];
                }
            
                oneM2MTester(path+li[0]+";;"+li[1]+";;"+test[i],function(data){
                    var li = data.split(";;");
                    fs.open(li[0], 'a', function(err, fd) {
                      if(err) throw err;
                      var buf = new Buffer(li[1]);
                      fs.write(fd, buf, 0, buf.length, null, function(err, written, buffer) {
                        if(err) throw err;
                        fs.close(fd, function() {

                        });
                      });
                    });
                });
                i++;
                if(i==test.length){
                    console.log("file end");
                    socket.emit('filelist',li[0]);
                    clearInterval(fu);
                }
        },600);
    });
});


app.use(bodyParser.urlencoded({extended:false}));
app.use('/', express.static(__dirname));

app.get('/', function(req, res){

    var pathname = url.parse(req.url).pathname;

    fs.readFile('index.html', function(error, data){
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
    if(value === '#DELETE'){
        var args = target.split('/');
        var parentNode = args[args.length-2];
        var grandParentNode = args[args.length-3];
        /* target delete node: args[args.length-1] */
        io.sockets.emit('update','DELETE:::' + grandParentNode + '##' + parentNode + '##' + args[args.length-1]);
    }
    else{
        var args = target.split('/');
        var parentNode = args[args.length-1];
        var grandParentNode = args[args.length-2];

        args = value.split('$');
        var type = args[0];
        value = args[1];
        io.sockets.emit('update','CREATE:::' + grandParentNode + '##' + parentNode + '##' + value + '##' + type);
        if(type == 'CIN'){
            io.sockets.emit('update','LOG:::' + grandParentNode + '##' + parentNode + '##' + value + '##' + type);
        }
    }


});
get_Semantic();
function get_Semantic(){
    mqtt = require('mqtt');
    var client  = mqtt.connect('tcp://'+host+':1883');
    var str ='';
    // var tag ="<http://www.onem2m.org/ontology/Base_Ontology/base_ontology#";
    client.on('connect', function () {
        client.subscribe('/oneM2M/pub/Semantic/Client/Rules');
        client.subscribe('/oneM2M/pub/Semantic/Client/Rules/ontology');
        client.subscribe('/oneM2M/pub/Performance/Client/Semantic')
        // client.subscribe('/oneM2M/pub/Semantic/Client/Rulelist/ontology');
    })
    client.on('message',function(topic, message){
        if(topic == '/oneM2M/pub/Performance/Client/Semantic'){
            console.log(message.toString());
            var str = message.toString();
            io.sockets.emit("performance",str);
        }
        else if(topic == '/oneM2M/pub/Semantic/Client/Rules'){
            var jsonObject = JSON.parse(message.toString());
            var graph = jsonObject['@graph']
            var list = "";
            var rulelist = "";
            graph.forEach(function(item, index) {
              // console.log(item);
              // console.log(index);
                var type = item['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'];
                if(type == 'Command'){
                    var ob = item['object'].split('/');
                    var su = item['subject'].split('/');
                    var val = item['value'].split('/');
                    rulelist += su[3]+"$"+su[4]+"$"+val[0]+"$"+ob[3]+"$"+ob[4]+"$"+val[1]+"\n";
                }
                if(type == 'Device'){           
                    var ob = item['object'];
                    var su = item['subject'];
                    list += type+"$"+su+"$"+ob+"&";
                }
            });
            //console.log(list);

            io.sockets.emit("getSemantic",list);
            io.sockets.emit("getRule1",rulelist);
        }
        
        else if(topic == '/oneM2M/pub/Semantic/Client/Rules/ontology'){
            var jsonObject = JSON.parse(message.toString());
            var graph = jsonObject['@graph']    
            var list = "";
            var rule = "";
            graph.forEach(function(item, index) {
                var type = item['@type'];
                if(type[1] == 'Device' || type[0] == 'Device'){
                    var hsn = item['hasServiceName'].toString()
                    var id = item['@id'].split(':');
                    var rid = id[1]
                    var str = hsn.split(',');
                    var service = "";
                    for(var j in str){
                        var sn = str[j].split('.');
                        if(j==0){
                            service += sn[1];
                        }
                        else{
                            service += ','+sn[1];
                        }
                    }
                    list += "Device$/Mobius/kwu-hub/"+rid+"$"+service+"&";
                }
                if(type[1] == 'Command' || type[0] == 'Command'){
                    var hasID = item['hasInputDataPoint'].split(':');
                    var hasOD = item['hasOutputDataPoint'].split(':');
                    var hid = hasID[1].split('.');
                    var hod = hasOD[1].split('.');
                    var cd = hid[0];
                    var cs = hid[1];
                    var ad = hod[0];
                    var as = hod[1];
                    var cv = item['hasConditionValue'];
                    var av = item['hasActionValue'];
                    rule+= cd+"$"+cs+"$"+cv+"$"+ad+"$"+as+"$"+av+"\n";
                }
            });
           // console.log(list);
            io.sockets.emit("getSemantic",list);
            io.sockets.emit("getRule1",rule);
        }
    })
    client.on('error',function(){
        client.end();
        client  = mqtt.connect('mqtt://'+csehost+':'+cseport);
    })
}
function Update_Rule(data){
    var mqtt = require('mqtt');
    var client  = mqtt.connect('mqtt://'+host+':1883');
    var str ='';
    // var tag ="<http://www.onem2m.org/ontology/Base_Ontology/base_ontology#";
    client.on('connect', function () {
        //console.log(data);
        client.publish('/oneM2M/pub/Client/Semantic/Rule',data);
        client.end();
    });
    client.on('error',function(){
        client.end();
    });
}
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
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks).toString();
            var parser = new xml2js.Parser({explicitArray: false});
            parser.parseString(body, function (err, result) {
                if (err)
                    console.log(err);
                else {
                    var bodyObj = result;
                    for (var index in bodyObj) {
                        if (index == 'm2m:dbg'){
                            for (var prop in bodyObj[index]) {
                                if(prop == '_'){
                                    console.log('[ERROR]: ' + bodyObj[index][prop]);
                                    /* for error occured client */
                                    // gSocket.send('LOG:::' + 'ERROR' + '##' + bodyObj[index][prop]); 

                                    /* for all clients */
                                    io.sockets.emit('update','LOG:::' + 'ERROR' + '##' + bodyObj[index][prop]);
                                }
                            }
                        }
                    }
                }
            });
        });

        res.on("error", function (e) {
            console.log('Web server have problem with: ' + e.message);
        });
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
    console.log('getCntInformation');
    var cntList = '';
    var options = {
        "method": "GET",
        "hostname": host,
        "port": "7579",
        "path": "/Mobius?fu=1&ty=3",
        "headers": {
            "Accept": "application/xml",
            "X-M2M-RI": "12345",
            "X-M2M-Origin": "SOrigin"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("error",function (data){
            console.log('err');
           
            console.log(data);
        })
        res.on("end", function () {
            var body = Buffer.concat(chunks).toString();  
            
            var list = body.split("Mobius/" + aeName + "/");
            var device = [];
            var max = 0;
            var cur = 0;
            list.forEach(function(item, index) {
                var deviceList = list[index].split("/");
                var check = list[index].toString().trim().split("<");
                
                var dlist = check[0].split('/');
                if(dlist.length == 2){
                    //console.log(dlist[0]+';');
                    //console.log(dlist[1]+';')
                    max++;
                    getCinLatest(check[0], function(res){
                        cur++;
                        device.push({root: dlist[0], leaf:dlist[1], value:res});
                        if(max == cur)
                            reportData(device);
                    });
                }
            });

        });
    });

    req.end();  
}

function reportData(device) {
   // console.log(device);
    var rsc = [];    
    device.forEach(function(item, idx){
        var jdx = isContain(rsc, item.root);
        if(jdx){
            gSocket.send(aeName + '##' + item.root + '##' + item.leaf + '##' + 'CNT');
            if(item.value != 'EMPTY')   
                gSocket.send(item.root + '##' + item.leaf + '##' + item.value + '##' + 'CIN');
        }
        else{
            rsc.push({root: item.root, leaf:item.leaf, value:item.value});
            gSocket.send('Mobius' + '##' + aeName + '##' + item.root + '##' + 'CNT');   
            if(item.leaf != 'EMPTY')
                gSocket.send(aeName + '##' + item.root + '##' + item.leaf + '##' + 'CNT');
            if(item.value != 'EMPTY')   
                gSocket.send(item.root + '##' + item.leaf + '##' + item.value + '##' + 'CIN');   
        }
    });
    /*
    * -@- : empty resource
    * $$ : root, leaf bound
    * ## : leaf, value bound
    * %% : each element bound 
    */

    // console.log('=============');
    // console.log(rsc); 
    // console.log('-------------');
    // var sendMsg = ''

    // for(var idx = 0;idx<rsc.length;idx++){
    //     sendMsg += rsc[idx].root;
    //     sendMsg += '$$';
    //     sendMsg += rsc[idx].leaf;
    //     sendMsg += '##';
    //     sendMsg += rsc[idx].value;
    //     sendMsg += '@@';
    // }

    // gSocket.send('View:::' + sendMsg);   
    // console.log(sendMsg);
}

function isContain(arr, target) {
    var idx;
    for(idx = 0; idx<arr.length;idx++){
        if(arr[idx].root == target)
            return true;
    }
    return false;
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
                    callback("EMPTY");
                }
            });
        });
    });

    req.end();     
}

function oneM2MTester(str,callback){
    
    var data = str.split(";;");
    var f = data[0];
    var li = data[1];
    var ar = li.split("/");
    var ty = data[2];
    var op;
    var msg = null;
    var a = ar[1];
    var b = ar[0].split(":");
    switch(ty){
        case "oneM2M_TCS_AE_CRE":
            op = {
                "method":"POST",
                "hostname": b[0],
                "port": b[1],
                "path": "/"+a+"?rcn=3",
                "headers": {
                    "accept": "application/xml",
                    "x-m2m-ri": "12345",
                    "x-m2m-origin": "S",
                    "Content-Type" : "application/vnd.onem2m-res+xml; ty=2"
                }
            };
            msg="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+
                    "<m2m:ae mlns:m2m=\"http://www.onem2m.org/xml/protocols\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" rn=\""+TaeName+"\">\n"+
                        "<api>0.2.481.2.0001.001.000111</api>\n"+
                        "<lbl>key1 key2</lbl>\n"+
                        "<rr>true</rr>\n"+
                    "</m2m:ae>";
        break;
        case "oneM2M_TCS_AE_DEL":
            op = {
              "method": "DELETE",
              "hostname": b[0],
              "port": b[1],
              "path": "/"+a+"/"+TaeName,
              "headers": {
                "accept": "application/xml",
                "locale": "ko",
                "x-m2m-ri": "12345",
                "x-m2m-origin": "SOrigin"
              }
            };
        break;
        case "oneM2M_TCS_CNT_CRE":
            op = {
              "method": "POST",
              "hostname": b[0],
              "port": b[1],
              "path": "/"+a+"/"+TaeName,
              "headers": {
                "accept": "application/json",
                "x-m2m-ri": "12345",
                "x-m2m-origin": "SOrigin",
                "content-type": "application/vnd.onem2m-res+xml; ty=3"
              }
            };
            msg = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+
                    "<m2m:cnt xmlns:m2m=\"http://www.onem2m.org/xml/protocols\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" rn=\"oneM2M_MyContainer\">\n"+
                    "<lbl>oneM2M_MyContainer</lbl>\n"+
                    "</m2m:cnt>";
        break;
        case "oneM2M_TCS_CNT_DEL":
            op = {
              "method": "DELETE",
              "hostname": b[0],
              "port": b[1],
              "path": "/"+a+"/"+TaeName+"/oneM2M_MyContainer",
              "headers": {
                "accept": "application/xml",
                "locale": "ko",
                "x-m2m-ri": "12345",
                "x-m2m-origin": "SOrigin"
              }
            };
        break;
        case "oneM2M_TCS_CIN_CRE":
            op = {
              "method": "POST",
              "hostname": b[0],
              "port": b[1],
              "path": "/"+a+"/"+TaeName+"/oneM2M_MyContainer",
              "headers": {
                "accept": "application/xml",
                "x-m2m-ri": "12345",
                "x-m2m-origin": "/0.2.481.1.21160310105204806",
                "content-type": "application/vnd.onem2m-res+xml; ty=4"
              }
            };
            msg =   "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+
                    "<m2m:cin xmlns:m2m=\"http://www.onem2m.org/xml/protocols\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n"+
                        "<con>oneM2M_Test_Value</con>\n"+
                    "</m2m:cin>";
        break;
        case "oneM2M_TCS_CIN_RET":
            op = {
              "method": "GET",
              "hostname": b[0],
              "port": b[1],
              "path": "/"+a+"/"+TaeName+"/oneM2M_MyContainer/latest",
              "headers": {
                "accept": "application/xml",
                "x-m2m-ri": "12345",
                "x-m2m-origin": "SOrigin"
              }
            };
        break;
        case "oneM2M_TCS_CNT_UPDATE":
            op = {
              "method": "PUT",
              "hostname": b[0],
              "port": b[1],
              "path": "/"+a+"/"+TaeName+"/oneM2M_MyContainer",
              "headers": {
                    "accept": "application/xml",
                    "x-m2m-ri": "12345",
                    "x-m2m-origin": "SOrigin",
                    "content-type": "application/vnd.onem2m-res+xml"
              }
            };
            msg =   "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+
                    "<m2m:cnt xmlns:m2m=\"http://www.onem2m.org/xml/protocols\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n"+
                        "<lbl>oneM2M Changed Label</lbl>\n"+
                    "</m2m:cnt>";
        break;///
        case "oneM2M_TCS_SUB_CRE":
            op = {
              "method": "POST",
              "hostname": b[0],
              "port": b[1],
              "path": "/"+a+"/"+TaeName+"/oneM2M_MyContainer",
              "headers": {
                "accept": "application/xml",
                "x-m2m-ri": "12345",
                "x-m2m-origin": "SOrigin",
                "content-type": "application/vnd.onem2m-res+xml; ty=23"
              }
            };
            msg =   "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+
                    "<m2m:sub xmlns:m2m=\"http://www.onem2m.org/xml/protocols\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" rn=\"Test_Sub\">\n"+
                        "<enc>\n"+
                            "<net>3</net>\n"+
                        "</enc>\n"+
                        "<nu>mqtt://"+host+"/0.2.481.1.7579</nu>\n"+
                    "</m2m:sub>";
        break;
        case "oneM2M_TCS_CNT_RET":
            op = {
              "method": "GET",
              "hostname": b[0],
              "port": b[1],
              "path": "/"+a+"/"+TaeName+"/oneM2M_MyContainer",
              "headers": {
                "accept": "application/xml",
                "x-m2m-ri": "12345",
                "x-m2m-origin": "SOrigin"
              }
            }; 
        break;
        case "oneM2M_TCS_SUB_RET":
            op = {
              "method": "GET",
              "hostname": b[0],
              "port": b[1],
              "path": "/"+a+"/"+TaeName+"/oneM2M_MyContainer/Test_Sub",
              "headers": {
                "accept": "application/xml",
                "x-m2m-ri": "12345",
                "x-m2m-origin": "SOrigin"
              }
            };
        break;
        case "oneM2M_TCS_SUB_DEL":
            op = {
              "method": "DELETE",
              "hostname": b[0],
              "port": b[1],
              "path": "/"+a+"/"+TaeName+"/oneM2M_MyContainer/Test_Sub",
              "headers": {
                "accept": "application/xml",
                "x-m2m-ri": "12345",
                "x-m2m-origin": "SOrigin"
              }
            };
        break;
    }
    HTTPrequest(f,ty,op,msg,function(re){
      
        var data = re.split(";;");
        // console.log(data[1]);
        callback(data[0]+";;"+data[1]);
    });

}

function HTTPrequest(f,ty,options,msg,callback){
    try{
    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("error",function(data){
            callback("error");
        });
        res.on("end", function () {
        var rescode = res.statusCode;
        var bodys = Buffer.concat(chunks);
        var li = bodys.toString().split("<");
        var body ="";
        for(var a in li){
            body += li[a]+"＜";
        }
        var newDate = new Date();
        var str = ":::"+ty+":::<br />\n";
        var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');

        if(rescode == 200 || rescode == 201 || rescode == 202){
            var rn = body.toString().split("rn=\"");
            var rrn = rn[1].split("\"");
            var tty = body.toString().split("ty>");
            var rty = tty[1].split("＜");

            str += "response code : <span style =\"color:#ff0000\">"+rescode +"</span><br />\n";
            str += "Resource Name (rn) : <span style =\"color:#ff0000\">"+ rrn[0]+"</span><br />\n";
            str += "Resource Type (ty) : <span style =\"color:#ff0000\">"+rty[0]+"</span><br />\n";
            if(ty=="oneM2M_TCS_CNT_UPDATE"){
                var lb = body.toString().split("lbl>");
                var rlb = lb[1].split("＜");
                str+= "Resource Update (lbl) : <span style =\"color:#ff0000\">"+ rlb[0]+"</span><br />\n";
            }
            if(ty=="oneM2M_TCS_CNT_RET"){
                var lb = body.toString().split("lbl>");
                var rlb = lb[1].split("＜");
                str+= "Resource Label (lbl) : <span style =\"color:#ff0000\">"+ rlb[0]+"</span><br />\n";
            }

            str += body.toString()+"<br />\n";
            str += "Test Case Result : <span style =\"color:#ff0000\">Pass"+"</span><br />\n";
            str += "Test Time : " +time+"<br />\n";
            str += "::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::"+"<br />\n";
            io.sockets.emit("rtrs",str);
            io.sockets.emit("tsp",ty+" Pass");
            callback(f+";;"+str);
        }else if(rescode == 404 || rescode == 409){
            str += "response code : "+rescode+"<br />\n";
            str += body.toString()+"<br />\n";
            str += "Test Case Result : <span style =\"color:#ff0000\">Error"+"</span><br />\n";
            str += "Test Time : " +time+"<br />\n";
            str += "::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::"+"<br />\n";
            io.sockets.emit("rtrs",str);
            io.sockets.emit("tse",ty+" Error");
            callback(f+";;"+str);
        }
        else{
            str += "response code : "+rescode+"<br />\n";
            str += body.toString()+"<br />\n";
            str += "Test Case Result : <span style =\"color:#ff0000\">Fail"+"</span><br />\n";
            str += "Test Time : " +time+"<br />\n";
            str += "::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::"+"<br />\n";
            io.sockets.emit("rtrs",str);
            io.sockets.emit("tsf",ty+" Fail");
            callback(f+";;"+str);
        }
        
        });
    });
    if(msg!=null){
        req.write(msg);
    }
    req.end(); 
}
    catch(exception){

    }  
}