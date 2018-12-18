function change(path, value){
  socket.emit('createCin', {text: path + ' ' + value});
}

function controller(target, type, dur, isHtml) {
  var ctrl = $('#div_sidebar1');
  var imageSize = ctrl.width() / 4;
  var targetImage;

  var controlFunc = '<option>Choose device function</option>';
  switch(target){
    case 'Lockitron':
      targetImage = '<img style="border:1px solid #000000" src="../images/Lockitron.png" width="' + imageSize + '" height="' + imageSize +' border=1">';
      Lockitron_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
    case 'Nest':
      targetImage = '<img style="border:1px solid #000000" src="../images/Nest.png" width="' + imageSize + '" height="' + imageSize +' border=1">';
      Nest_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
    case 'SmartThings':
      targetImage = '<img style="border:1px solid #000000" src="../images/SmartThings.png" width="' + imageSize + '" height="' + imageSize +'">';
      SmartThings_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
    case 'AJ-Lamp':
      targetImage = '<img style="border:1px solid #000000" src="../images/AJ-Lamp.jpg" width="' + imageSize + '" height="' + imageSize +'">';
      Lamp_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
    case 'Foobot':
      targetImage = '<img style="border:1px solid #000000" src="../images/Foobot.jpg" width="' + imageSize + '" height="' + imageSize +'">';
      Foobot_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
    case 'Hue-Lamp':
      targetImage = '<img style="border:1px solid #000000" src="../images/Hue.jpg" width="' + imageSize + '" height="' + imageSize +'">';
      Lamp_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
    case 'AJ-Plug':
      targetImage = '<img style="border:1px solid #000000" src="../images/AJ-Plug.png" width="' + imageSize + '" height="' + imageSize +'">';
      Plug_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
    case 'Sensor-Temp_Humid':
      targetImage = '<img style="border:1px solid #000000" src="../images/Sensor-Temp_Humid.png" width="' + imageSize + '" height="' + imageSize +'">';
      Sensor_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
    case 'Sensor-Ultrasonic':
      targetImage = '<img style="border:1px solid #000000" src="../images/Sensor-Ultrasonic.png" width="' + imageSize + '" height="' + imageSize +'">';
      Sensor_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
    case 'Sensor-Illuminance':
      targetImage = '<img style="border:1px solid #000000" src="../images/Sensor-Illuminance.png" width="' + imageSize + '" height="' + imageSize +'">';
      Sensor_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
    case 'WeMo-Switch':
      targetImage = '<img style="border:1px solid #000000" src="../images/Wemo-Switch.png" width="' + imageSize + '" height="' + imageSize +'">';
      WeMo_function.forEach(function(n,i){controlFunc += '<option>'+ n.func + '</option>';});
      break;
  }

 var elem = $('<div id="Device_' + target +'" class="controller ' + (type || 'white') + '" />').html(
    '<table id="tb_' + target + '" width="100%" height=92px border="0" cellpadding="3px">' + 
      '<tr>' + 
        '<select style="width:100%" id="ctrlFunc_' + target + '">' + 
            controlFunc + 
        '</select>' + 
        '<td id="controllerFunction" style="width:25%" rowspan="3">' + targetImage + '</td>' +
      '</tr>' +
    '</table>'
    )
  .prependTo(ctrl);

  var selectedFunction = document.getElementById("ctrlFunc_"+target);
  selectedFunction.addEventListener("click",function(e) {
    for(var i = $('#tb_' + target + ' tr').length-1; i>0;i--)
      $('#tb_' + target + ' tr')[i].remove();

    var func = selectedFunction.options[selectedFunction.selectedIndex].text;
    if(func != 'Choose device function'){
      var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);
      var tmpFunc;
      if(func == 'TargetTemp')
        tmpFunc = 'target_temperature';
      else if(func == 'TargetTempType')
        tmpFunc = 'target_temperature_type';
      else if(func == 'CurrentTemp')
        tmpFunc = 'current_temperature'
      else
        tmpFunc = func;

      nodes.forEach(function(n,i){
        if(n.ty == 'cin' && n.parent.name == tmpFunc && n.parent.parent.name == target){
          var tableLength = $('#tb_' + target + ' tr').length;
          if(tableLength == 1){
            newRow = document.getElementById("tb_"+target).insertRow().insertCell();
            // newRow.innerHTML='Content: \n' + n.value;
            if(n.value.length > 18){
              msg = '[' + n.value.substring(0,18) + '...]';
              newRow.innerHTML='<td><b>' + msg + '</b><button type="button" style="float:right;" id="detail_' + target + '">Detail</button></td>'
              document.getElementById('detail_' + target).addEventListener("click", function() {
                if(target == 'Foobot'){
                  var msg = n.value.split('/');
                  alert(
                    'Particulate matter: ' + msg[0] + '\n' +
                    'Temperature: ' + msg[1] + '\n' +
                    'Humidity: ' + msg[2] + '\n' +
                    'Carbon dioxide: ' + msg[3] + '\n' +
                    'Volatile compounds: ' + msg[4] + '\n' +
                    'Degree of air pollution: ' + msg[5] + '\n'
                  );
                }
                else if(target == 'AJ-Plug'){
                  var msg = n.value.split('/');
                  alert(
                    msg[0] + '\n' +
                    msg[1] + '\n' +
                    msg[2] + '\n' +
                    msg[3] + '\n' +
                    msg[4] + '\n' +
                    msg[5] + '\n'
                  );
                }
            }, false);
            }
            else{
              msg = '[' + n.value + ']';
              newRow.innerHTML='<td><b>' + msg + '</b></td>'
            }
            
          }
        }
      });                     

    DEVICE.forEach(function(n,i){
      if(target.includes(n.name)){
        n.obj.forEach(function(idx,jdx){

          if(idx.func == func && idx.input == true && !document.getElementById("input_"+target)){
            newRow = document.getElementById("tb_"+target).insertRow().insertCell();
            newRow.setAttribute('id', "inputRow_"+target);

            if(func == 'TargetTemp')
              func = 'target_temperature';
            else if(func == 'TargetTempType')
              func = 'target_temperature_type';

            var path = '/Mobius/' + aeName + '/' + target + '/' + func;
            newRow.innerHTML='<td><input type="text" style="width:100%" id="input_' + target + '"/><div class="centerWrapper"><button type="button" style="width:100%; margin-top: 5px;" id="btn_' + target + '">Update content value</button></div></td>';
            document.getElementById('btn_' + target).addEventListener("click", function() {
              change(path, $('#input_' + target).val());

              /* reset */
              for(var i = $('#tb_' + target + ' tr').length-1; i>0;i--)
                $('#tb_' + target + ' tr')[i].remove();
              var selectedFunction = document.getElementById("ctrlFunc_"+target);
              selectedFunction.selectedIndex = 0;
            }, false);
          }
        });
        
      }
    }); 
    }
    else{

    }
  });
  elem.on('click', function () {
  });

  elem.slideDown(200, function () {
  });
}

function escapeHtml(raw) {
  var regex = /[&<>"'` !@$%()=+{}[\]]/g;
  return raw.replace(regex, function onReplace(match) {
    return '&#' + match.charCodeAt(0) + ';';
  });
}