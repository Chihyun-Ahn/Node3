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
var socket = require('socket.io-client')('http://223.194.33.87:3000');

// Parse database
var network = can.parseNetworkDescription("./node_modules/socketcan/samples/mycan_definition.kcd");
var channel = can.createRawChannel("can0");
var db = new can.DatabaseService(channel, network.buses["FarmBUS"]);

channel.start();

var house = [
   {
      temperature: [0,0,0,0,0,0],
      humidity:["","","","","",""],
      sigTime:["",""]
   },
   {
      temperature: [0,0,0,0,0,0],
      humidity:["","","","","",""],
      sigTime:["",""]
   }
];

// Listener for house1
db.messages["House1Temp"].signals["temperature1"].onUpdate(function(s) {
   house[0].temperature[0] = s.value;
   console.log("House1 temp1: " + house[0].temperature[0]);
});
db.messages["House1Temp"].signals["temperature2"].onUpdate(function(s) {
   house[0].temperature[1] = s.value;
   console.log("House1 temp2: " + house[0].temperature[1]);
});
db.messages["House1Temp"].signals["temperature3"].onUpdate(function(s) {
   house[0].temperature[2] = s.value;
   console.log("House1 temp3: " + house[0].temperature[2]);
});
db.messages["House1Temp"].signals["temperature4"].onUpdate(function(s) {
   house[0].temperature[3] = s.value;
   console.log("House1 temp4: " + house[0].temperature[3]);
});
db.messages["House1Temp"].signals["temperature5"].onUpdate(function(s) {
   house[0].temperature[4] = s.value;
   console.log("House1 temp5: " + house[0].temperature[4]);
});
db.messages["House1Temp"].signals["temperature6"].onUpdate(function(s) {
   house[0].temperature[5] = s.value;
   console.log("House1Stat2 temp3: " + house[0].temperature[5]);
});
db.messages["House1TempTime"].signals["sigTime"].onUpdate(function(s) {
   house[0].sigTime[0] = s.value;
   console.log("House1Temp sigTime: " + house[0].sigTime[0]);
});

db.messages["House1Humid"].signals["humidity1"].onUpdate(function(s) {
   house[0].humidity[0] = s.value;
   console.log("House1 humid1: " + house[0].humidity[0]);
});
db.messages["House1Humid"].signals["humidity2"].onUpdate(function(s) {
   house[0].humidity[1] = s.value;
   console.log("House1 humid2: " + house[0].humidity[1]);
});
db.messages["House1Humid"].signals["humidity3"].onUpdate(function(s) {
   house[0].humidity[2] = s.value;
   console.log("House1 humid3: " + house[0].humidity[2]);
});
db.messages["House1Humid"].signals["humidity4"].onUpdate(function(s) {
   house[0].humidity[3] = s.value;
   console.log("House1 humid4: " + house[0].humidity[3]);
});
db.messages["House1Humid"].signals["humidity5"].onUpdate(function(s) {
   house[0].humidity[4] = s.value;
   console.log("House1 humid5: " + house[0].humidity[4]);
});

db.messages["House1Humid"].signals["humidity6"].onUpdate(function(s) {
   house[0].humidity[5] = s.value;
   console.log("House1 humid6: " + house[0].humidity[5]);
});
db.messages["House1HumidTime"].signals["sigTime"].onUpdate(function(s) {
   house[0].sigTime[1] = s.value;
   console.log("House1 Humid sigTime: " + house[0].sigTime[1]);
});
// Listener for house2
db.messages["House2Temp"].signals["temperature1"].onUpdate(function(s) {
   house[0].temperature[0] = s.value;
   console.log("House2 temp1: " + house[0].temperature[0]);
});
db.messages["House2Temp"].signals["temperature2"].onUpdate(function(s) {
   house[0].temperature[1] = s.value;
   console.log("House2 temp2: " + house[0].temperature[1]);
});
db.messages["House2Temp"].signals["temperature3"].onUpdate(function(s) {
   house[0].temperature[2] = s.value;
   console.log("House2 temp3: " + house[0].temperature[2]);
});
db.messages["House2Temp"].signals["temperature4"].onUpdate(function(s) {
   house[0].temperature[3] = s.value;
   console.log("House2 temp4: " + house[0].temperature[3]);
});
db.messages["House2Temp"].signals["temperature5"].onUpdate(function(s) {
   house[0].temperature[4] = s.value;
   console.log("House2 temp5: " + house[0].temperature[4]);
});
db.messages["House2Temp"].signals["temperature6"].onUpdate(function(s) {
   house[0].temperature[5] = s.value;
   console.log("House2Stat2 temp3: " + house[0].temperature[5]);
});
db.messages["House2TempTime"].signals["sigTime"].onUpdate(function(s) {
   house[0].sigTime[0] = s.value;
   console.log("House2Temp sigTime: " + house[0].sigTime[0]);
});

db.messages["House2Humid"].signals["humidity1"].onUpdate(function(s) {
   house[0].humidity[0] = s.value;
   console.log("House2 humid1: " + house[0].humidity[0]);
});
db.messages["House2Humid"].signals["humidity2"].onUpdate(function(s) {
   house[0].humidity[1] = s.value;
   console.log("House2 humid2: " + house[0].humidity[1]);
});
db.messages["House2Humid"].signals["humidity3"].onUpdate(function(s) {
   house[0].humidity[2] = s.value;
   console.log("House2 humid3: " + house[0].humidity[2]);
});
db.messages["House2Humid"].signals["humidity4"].onUpdate(function(s) {
   house[0].humidity[3] = s.value;
   console.log("House2 humid4: " + house[0].humidity[3]);
});
db.messages["House2Humid"].signals["humidity5"].onUpdate(function(s) {
   house[0].humidity[4] = s.value;
   console.log("House2 humid5: " + house[0].humidity[4]);
});

db.messages["House2Humid"].signals["humidity6"].onUpdate(function(s) {
   house[0].humidity[5] = s.value;
   console.log("House2 humid6: " + house[0].humidity[5]);
});
db.messages["House2HumidTime"].signals["sigTime"].onUpdate(function(s) {
   house[0].sigTime[1] = s.value;
   console.log("House2 Humid sigTime: " + house[0].sigTime[1]);
   console.log("house1, 2 data is sent to socket connection.");
   socket.emit('house',house);
});

socket.on('connect', function(){
   console.log('socket connected.');
});

// socket.on('giveMeData', ()=>{
//    console.log('farmInfo data is sent. current time: '+new Date());
//    socket.emit('house',house);
// });

socket.on('controlData', (dataBean)=>{
   db.messages["House1Ctrl"].signals["fan1"].update(dataBean.house[0].fan[0]);
   db.messages["House1Ctrl"].signals["fan2"].update(dataBean.house[0].fan[1]);
   db.messages["House1Ctrl"].signals["fan3"].update(dataBean.house[0].fan[2]);
   db.messages["House1Ctrl"].signals["water"].update(dataBean.house[0].water);
   db.messages["House1Ctrl"].signals["alarm"].update(dataBean.house[0].alarm);
   db.send("House1Ctrl");
   db.messages["House2Ctrl"].signals["fan1"].update(dataBean.house[1].fan[0]);
   db.messages["House2Ctrl"].signals["fan2"].update(dataBean.house[1].fan[1]);
   db.messages["House2Ctrl"].signals["fan3"].update(dataBean.house[1].fan[2]);
   db.messages["House2Ctrl"].signals["water"].update(dataBean.house[1].water);
   db.messages["House2Ctrl"].signals["alarm"].update(dataBean.house[1].alarm);
   db.send("House2Ctrl");
});
