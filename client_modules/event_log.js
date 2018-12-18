function divAlert(time, target, func, msg, type, dur, isHtml) {
  var alertDiv = $('#div_sidebar2');

  if(msg.length > 12){
    msg = '[' + msg.substring(0,12) + '...]';
  }
  else
    msg = '[' + msg + ']';

  var imageSize = alertDiv.width() / 4;
  var targetImage;
  if(func == 'target_temperature')
    func = 'TargetTemp';
  else if(func == 'current_temperature')
    func = 'CurrentTemp';
  else if(func == 'target_temperature_type')
    func = 'TargetTempType';
  
  switch(target){
    case 'WeMo-Switch':
      targetImage = '<img src="../images/Wemo-Switch.png" width="' + imageSize + '" height="' + imageSize +'">'; 
      break;
    case 'Nest':
      targetImage = '<img src="../images/Nest.png" width="' + imageSize + '" height="' + imageSize +'">';
      break;
    case 'SmartThings':
      targetImage = '<img src="../images/SmartThings.png" width="' + imageSize + '" height="' + imageSize +'">';
      break;
    case 'AJ-Lamp':
      targetImage = '<img src="../images/AJ-Lamp.jpg" width="' + imageSize + '" height="' + imageSize +'">';
      break;
    case 'Foobot':
      targetImage = '<img src="../images/Foobot.jpg" width="' + imageSize + '" height="' + imageSize +'">';
      break;
    case 'Hue-Lamp':
      targetImage = '<img src="../images/Hue.jpg" width="' + imageSize + '" height="' + imageSize +'">';
      break;
    case 'AJ-Plug':
      targetImage = '<img src="../images/AJ-Plug.png" width="' + imageSize + '" height="' + imageSize +'">';
      break;
    case 'Sensor-Temp_Humid':
      targetImage = '<img src="../images/Sensor-Temp_Humid.png" width="' + imageSize + '" height="' + imageSize +'">';
      break;
    case 'Sensor-Ultrasonic':
      targetImage = '<img src="../images/Sensor-Ultrasonic.png" width="' + imageSize + '" height="' + imageSize +'">';
      break;
    case 'Sensor-Illuminance':
      targetImage = '<img src="../images/Sensor-Illuminance.png" width="' + imageSize + '" height="' + imageSize +'">';
      break;
    case 'Lockitron':
      targetImage = '<img src="../images/Lockitron.png" width="' + imageSize + '" height="' + imageSize +'">';
      break;
  }

  var elem = $('<div class="alertDiv ' + (type || 'white') + '" />').html(
    '<table width="100%" border="1">' + 
      '<tr>' + 
        '<td width="25%" rowspan="2">' + targetImage + '</td>' +
        '<td align=center>' + time + '</td>' +
      '</tr>' +
      '<tr>' + 
        '<td align=center>' + '<b>[' + func +'] </b>is ' + '<br>updated to <b>' +  msg + '</b></td>' + 
      '</tr>' + 
    '</table>'
    )
  .prependTo(alertDiv);
  elem.on('click', function () {
    $(this).remove();
  });

  elem.slideDown(200, function () {
  });
}

function errorAlert(time, msg, type, dur, isHtml) {
  var alertDiv = $('#div_sidebar2');
  
  var imageSize = alertDiv.width() / 4;
  var targetImage = '<img src="../images/Error.png" width="' + imageSize + '" height="' + imageSize +'">';

  var elem = $('<div class="alertDiv ' + (type || 'white') + '" />').html(
    '<table width="100%" border="1">' + 
      '<tr>' + 
        '<td width="25%" rowspan="2">' + targetImage + '</td>' +
        '<td align=center>' + time + '</td>' +
      '</tr>' +
      '<tr>' + 
        '<td align=center>' + '<b>[' + 'Error' + ']</b>' + '<br><b>' +  msg + '</b></td>' + 
      '</tr>' + 
    '</table>'
    )
  .prependTo(alertDiv);

  elem.on('click', function () {
    $(this).remove();
  });

  elem.slideDown(100, function () {
  });
}