var http = require("http");
for(var i = 0 ; i < 50 ; i ++){
  var options = {
    "method": "POST",
    "hostname": "128.134.65.120",
    "port": "7579",
    "path": "/Mobius/kwu-hub/Test/Test-service",
    "headers": {
      "Accept": "application/xml",
      "X-M2M-RI": "12345",
      "X-M2M-Origin": "/0.2.481.1.21160310105204806",
      "Content-Type": "application/vnd.onem2m-res+xml; ty=4"
    }
  };

  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });

  req.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<m2m:cin xmlns:m2m=\"http://www.onem2m.org/xml/protocols\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n    <con>21</con>\n</m2m:cin>\n\n");
  req.end();
}