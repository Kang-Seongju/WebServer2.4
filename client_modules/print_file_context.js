function printfilecontext(data){
	var tmp = data.split('Verdict: ');
	$('#div_log').append("<h4>"+tmp[0]+"</h4>");
	$('#div_log').append("<g>"+'Verdict: ' + tmp[1]+"</g>");
	document.getElementById("div_log").scrollTop = document.getElementById("div_log").scrollHeight;
}