function printfilelist(file){

  $("#selectable").append("<a><li id = \""+file+"\">"+file+"</li></a>");
  document.getElementById("div_file").scrollTop = document.getElementById("div_file").scrollHeight;
}
var tsc = document.getElementById("selectable");
tsc.addEventListener("click",function(e) {
  $("#div_log").empty();
  if(e.target.id != "selectable" && e.target.id != "" ){
     socket.emit('fileread',e.target.id);
  }
});