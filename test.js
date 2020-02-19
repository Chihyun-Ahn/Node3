var aa = 34521157
var bb = millToTime(aa);
console.log(bb);

function millToTime(miltime){
    var imsi;
    var hour = parseInt(miltime/3600000);
    console.log(hour);
    imsi = miltime%3600000;
    var min = parseInt(imsi/60000);
    console.log(min);
    imsi = imsi%60000;
    var sec = parseInt(imsi/1000);
    console.log(sec);
    imsi = imsi%1000;
    var milli = imsi;
    var result = addZero(hour)+addZero(min)+addZero(sec)+addZeroMilli(milli);
    console.log(result);
    return result;
}

function addZero(num){
    var n = num.toString();
    var x = (n<10)?("0"+n):(""+n);
    return x;
}

function addZeroMilli(num){
    var result = "";
    if(num<10){
        result = "00" + num;
    }else if(num >= 10 && num < 100){
        result = "0" + num;
    }else if(num >= 100 && num < 1000){
        result = "" + num;
    }else{
        console.log('addZeroMilli: Input value is invalid.');
    }
    return result;
}