function semantic_monitoring(){
	var mqtt = require('mqtt');
	var csehost = "128.134.65.120"
	var cseport = "1883"
	var client  = mqtt.connect('mqtt://'+csehost+':'+cseport);
	var str ='';
	// var tag ="<http://www.onem2m.org/ontology/Base_Ontology/base_ontology#";
	client.on('connect', function () {
		client.subscribe('/oneM2M/pub/Semantic/Mobius/XML');
	})
	client.on('message',function(topic, message){
		// console.log(message.toString());
		var jsonObject = JSON.parse(message.toString());
		var graph = jsonObject['@graph']
		for(var i in graph){
			var id = graph[i]['@id'];
			var anal_id = id.split("#");
			if(anal_id[1] == "Rule"){
				
			}else{
				var ob = graph[i].object;
				var su = graph[i].subject
				var ty = graph[i]['rdf:type'];
				var value = graph[i].value;
				console.log(ty);
				if(ty == 'Device'){
					for(var i in ob){
						$("#subject").append("<option value="+id+">"+su+"</option>");
						$("#object").append("<option value="+ob[i]+">"+ob[i]+"</option>");
						console.log(ob[i]);
					}
				}
			}
			// else{
			// 	console.log(ob)
			// }
			// console.log(su)
			// console.log(ty)
			// if(ty == 'Service'){
			// 	console.log(value)
			// }
			// console.log("\n");
		}
		
	})
	client.on('error',function(){
		client.end();
		client  = mqtt.connect('mqtt://'+csehost+':'+cseport);
	})
}
