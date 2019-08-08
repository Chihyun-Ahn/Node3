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
var fs = require('fs');

// Parse database
var network = can.parseNetworkDescription("./node_modules/socketcan/samples/mycan_definition.kcd");
var channel = can.createRawChannel("can0");
var db = new can.DatabaseService(channel, network.buses["FarmBUS"]);

channel.start();

// Register a listener to get any value changes
// db_instr.messages["TankController"].signals["TankTemperature"].onChange(function(s) {
//    console.log("Tank Temperature " + s.value);
// });

// Register a listener to get any value updates
db.messages["TankController"].signals["TankTemperature"].onUpdate(function(s) {
   console.log("Tank Temperature " + s.value);
});