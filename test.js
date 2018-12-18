var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://128.134.65.120:1883');
var str ='';
var getRuleTopic = "/oneM2M/pub/Client/Semantic/Rule";
var postRuleTopic = "/oneM2M/pub/Semantic/Client/Rule";
var MonitoringTopic = "/oneM2M/sub/Semantic/Mobius/Json";
var oneM2MTranslateTopic = "/oneM2M/sub/Semantic/Client/XML";
// var tag ="<http://www.onem2m.org/ontology/Base_Ontology/base_ontology#";
var n = 100;
client.on('connect', function () {

});
client.on('error',function(){
    client.end();
});
var s = 0;
var n = 200;
make_device(); 
// delete_device();
// make_service();
// update_cnt();
function make_device(){
	for(var i = s ; i < n ; i ++){
    	var data = "cnt&/Mobius/kwu-hub/Test"+i+"&Test"+i;
   		client.publish(MonitoringTopic,data);
   		console.log(data);
	}
}
function make_service(){
	for(var i = s ; i < n ; i ++){
    	var data = "cnt&/Mobius/kwu-hub/Test"+i+"/Service"+i+"&Service"+i;
   		client.publish(MonitoringTopic,data);
   		console.log(data);
	}
}
function delete_device(){
	for(var i = s ; i < n ; i ++){
    	var data = "delete&/Mobius/kwu-hub/Test"+i;
   		client.publish(MonitoringTopic,data);
   		console.log(data);
	}
}
function update_cnt(){
	for(var i = 0 ; i < 100 ; i ++){
		//cin&/Mobius/kwu-hub/Test&Test-Service&Value
    	var data = "cin&/Mobius/kwu-hub/Test"+i+"&Service"+i+"&"+i;
   		client.publish(MonitoringTopic,data);
   		console.log(data);
	}
}

// i = 0;
// setInterval(function(){
// 	if(i<500){
//     	var data = "ADD&if this [/Mobius/kwu-hub/test"+i+"]'s [f-test"+i+"] is [equals] than ["+i+"] ,then [/Mobius/kwu-hub/test"+i+"]'s [f-test"+i+"] turn to ["+i+"]";
//    		client.publish(getRuleTopic,data);
//    		console.log(data);
//    		i++;
//    }
// },10);
// setInterval(function(){
// 	if(i<1000){
//     	var data = "ADD&if this [/Mobius/kwu-hub/test"+i+"]'s [f-test"+i+"] is [equals] than ["+i+"] ,then [/Mobius/kwu-hub/test"+i+"]'s [f-test"+i+"] turn to ["+i+"]";
//    		client.publish(MonitoringTopic,data);
//    		console.log(data);
//    		i++;
//    }
// },10);
// setInterval(function(){
// 	if(i<1000){
//     	var data = "ADD&if this [/Mobius/kwu-hub/test"+i+"]'s [f-test"+i+"] is [equals] than ["+i+"] ,then [/Mobius/kwu-hub/test"+i+"]'s [f-test"+i+"] turn to ["+i+"]";
//    		client.publish(MonitoringTopic,data);
//    		console.log(data);
//    		i++;
//    }
// },10);

//cnt&/Mobius/kwu-hub/Test&Test
//cnt&/Mobius/kwu-hub/Test/Test-Service&Test-Service
//cin&/Mobius/kwu-hub/Test&Test-Service&Value
//delete&/Mobius/kwu-hub/Test