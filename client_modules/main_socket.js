    var tree, svg, rsc, root;
    var socket;
    var idx = 1;
    var host = "128.134.65.118";
    var aeName = "kwu-hub";
    
    function getResource() {
      socket.emit('getResource');   
    }
    window.onload = function() {
      socket = io.connect('http://' + host, {
        'reconnect': true,
        'resource': 'socket.io'
      });
      socket.on('connect', function() {
        getResource();
      });

      socket.on('message', function(msg) {
        var cmd = msg.split(":::");
        switch(cmd[0]){
          case 'LOG': 
            var now =  new Date().toString();
            var args = cmd[1].split("##");

            if(args[0] == 'ERROR'){
              /* args[1]: error content */
              errorAlert(now.substring(4,24), args[1],'red');
            }
            else{
              /*
              * args[0]/args[1]: path
              * args[2]: value
              */
              divAlert(now.substring(4,24), args[0], args[1], args[2],'blue');
            }
            
            
            break;
          case 'CREATE':
            var args = cmd[1].split("##");
            
            switch(args[3]){
              case 'CNT':
                /*
                / args[0]: grand parent
                / args[1]: parent
                / args[2]: new node name
                / args[3]: node type
                */
                addNode(args[0], args[1], args[2], args[3]);
                if(args[1] == aeName)
                  controller(args[2],'green');
                break;
              case 'CIN':
                /*
                / args[0]: grand parent
                / args[1]: parent
                / args[2]: value
                / args[3]: node type
                */
                delNode(args[0], args[1], 'Content');
                addNode(args[0], args[1], args[2], args[3]);

                var now =  new Date().toString();
                break;
            }  
            break;
          case 'DELETE':
            var args = cmd[1].split("##");
            console.log('args[0]: ' + args[0], ' args[1]: ' + args[1], ' args[2]: ' + args[2]);

            if(args[1] == aeName){
              console.log('Remove [Device_'+args[2]+' List');
              document.getElementById('Device_'+args[2]).remove();
            }
            delNode(args[0], args[1], args[2]);
            break;
        }
      });
    }
