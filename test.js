var edgeDeadTimer = [0,0];
var sendProbe = [0,0];
sendProbe[0] = setInterval(()=>{
    console.log('sendProbe[0] setInterval. ');
}, 1000);
sendProbe[1] = setInterval(()=>{
    console.log('sendProbe[1] setInterval. ');
}, 1000);

edgeDeadTimer[0] = setInterval(()=>{
    console.log('sendProbe[0] setInterval. ');
}, 1000);
edgeDeadTimer[1] = setInterval(()=>{
    console.log('sendProbe[1] setInterval. ');
}, 1000);


clearInterval(sendProbe[0]);
clearInterval(sendProbe[1]);
