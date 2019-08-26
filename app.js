var exec = require('child_process').exec;
//Activate real canbus: can0
exec("sudo ip link set can0 up type can bitrate 500000", function(err, stdout, stderr){
   console.log('Activating can0...');
   console.log('stdout: '+ stdout);
   console.log('stderr: '+ stderr);
   if(err != null){
      console.log('error: '+ err);
   }else{
      console.log('Real CANBUS can0 activated.');
   }
});

var can = require('socketcan');

// Parse database
var network = can.parseNetworkDescription("./node_modules/socketcan/samples/mycan_definition.kcd");
var channel = can.createRawChannel("can0");
var db = new can.DatabaseService(channel, network.buses["FarmBUS"]);

channel.start();

var house1Sensors = {
   temperature1: 0,
   temperature2: 0,
   humidity1: "",
   humidity2: "",
   sigTime: ""
};

var house2Sensors = {
   temperature1: 0,
   temperature2: 0,
   humidity1: "",
   humidity2: "",
   sigTime: ""
};

var farmInfo = [house1Sensors,house2Sensors];

// var farmInfo = [house1Sensors, house2Sensors];

// Register a listener to get any value updates
db.messages["House1Stat"].signals["temperature1"].onUpdate(function(s) {
   house1Sensors.temperature1 = s.value;
   console.log("House1 temp1: " + house1Sensors.temperature1);
});
db.messages["House1Stat"].signals["temperature2"].onUpdate(function(s) {
   house1Sensors.temperature2 = s.value;
   console.log("House1 temp2: " + house1Sensors.temperature2);
});
db.messages["House1Stat"].signals["humidity1"].onUpdate(function(s) {
   house1Sensors.humidity1 = s.value;
   console.log("House1 humid1: " + house1Sensors.humidity1);
});
db.messages["House1Stat"].signals["humidity2"].onUpdate(function(s) {
   house1Sensors.humidity2 = s.value;
   console.log("House1 humid2: " + house1Sensors.humidity2);
});
db.messages["House1Stat"].signals["sigTime"].onUpdate(function(s) {
   house1Sensors.sigTime = s.value;
   console.log("House1 time: " + house1Sensors.sigTime);
});

db.messages["House2Stat"].signals["temperature1"].onUpdate(function(s) {
   house2Sensors.temperature1 = s.value;
   console.log("House2 temp1: " + house2Sensors.temperature1);
});
db.messages["House2Stat"].signals["temperature2"].onUpdate(function(s) {
   house2Sensors.temperature2 = s.value;
   console.log("House2 temp2: " + house2Sensors.temperature2);
});
db.messages["House2Stat"].signals["humidity1"].onUpdate(function(s) {
   house2Sensors.humidity1 = s.value;
   console.log("House2 humid1: " + house2Sensors.humidity1);
});
db.messages["House2Stat"].signals["humidity2"].onUpdate(function(s) {
   house2Sensors.humidity2 = s.value;
   console.log("House2 humid2: " + house2Sensors.humidity2);
});
db.messages["House2Stat"].signals["sigTime"].onUpdate(function(s) {
   house2Sensors.sigTime = s.value;
   console.log("House2 time: " + house2Sensors.sigTime);
});

var socket = require('socket.io-client')('http://223.194.33.65:3000');

socket.on('connect', function(){
   console.log('socket connected.');
});

socket.on('giveMeData', ()=>{
   console.log('farmInfo data is sent. current time: '+new Date());
   socket.emit('farmInfo',farmInfo);
});

socket.on('controlData', (dataBean)=>{
   console.log(dataBean.house[0].fan1);
});
