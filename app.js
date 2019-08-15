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
var net = require('net');

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
};

var house2Sensors = {
   temperature1: 0,
   temperature2: 0,
   humidity1: "",
   humidity2: "",
};

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

// Set socket connection with server
var client = net.connect({
   port: 8100,
   host: '223.194.33.55'
}, function(){
   console.log('Client connected');
   client.write('Node3 client says: Hello.');
});

//Show server's message
client.on('data', function(data){
   console.log(data.toString());
});

client.on('end', function(){
   console.log('Client disconnected');
   client.end();
});

//Send sensor data to the server every 10 seconds
setInterval(function(){
   client.write(house1Sensors.toString());
}, 1000);