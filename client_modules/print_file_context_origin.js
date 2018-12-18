function printfilecontext(data){
  $('#div_log').append("<h4>"+data+"</h4>");
  document.getElementById("div_log").scrollTop = document.getElementById("div_log").scrollHeight;
}