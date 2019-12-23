function now(){
    var date = new Date();
    var hours = addZero(date.getHours());
    var mins = addZero(date.getMinutes());
    var secs = addZero(date.getSeconds());
    var millis = addZeroMilli(date.getMilliseconds());
    var timeSum = hours+':'+mins+":"+secs+":"+millis;
    console.log('현재: '+timeSum);
}

var i;
for(i=0;i<100;i++){
    now();
    console.log(addZeroMilli(i));
}

function addZero(num){
    var result = (num<10)?("0"+num):(num+"");
    return result;
}

function addZeroMilli(num){
    var result;
    if(num<10){
        result = "00"+num;
    }else if(num >=10 && num<100){
        result = "0"+num;
    }else if(num>=100 && num<1000){
        result = ""+num;
    }else{
        console.log('addZeroMilli: Input value is invalid.');
        return;
    }
    return result;
}