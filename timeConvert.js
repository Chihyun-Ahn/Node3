function convertToTime(intTime){
    var nowTime = new Date(intTime*1000);
    var year = nowTime.getFullYear();
    var month = nowTime.getMonth()+1;
    var date = nowTime.getDate();
    var hour = nowTime.getHours();
    var min = nowTime.getMinutes();
    var sec = nowTime.getSeconds();

    month = addZero(month);
    date = addZero(date);
    hour = addZero(hour);
    min = addZero(min);
    sec = addZero(sec);

    var returnString = year+"/"+month+"/"+date+"/"+hour+":"+min+":"+sec;

    return returnString;
}

function nowMilli(){
    var date = new Date();
    var h = date.getHours()*3600000;
    var m = date.getMinutes()*60000;
    var s = date.getSeconds()*1000;
    var mi = date.getMilliseconds();
    result = h+m+s+mi;
    return result;
}

function convertToMilli(time){
    var hour = parseInt(time.substr(0,2));
    var min = parseInt(time.substr(2,2));
    var sec = parseInt(time.substr(4,2));
    var milsec = parseInt(time.substr(6,3));

    var hourToMilli = hour*60*60*1000;
    var minToMilli = min*60*1000;
    var secToMilli = sec*1000;

    var result = hourToMilli+minToMilli+secToMilli+milsec;
    return result;
}

function millToTime(miltime){
    var imsi;
    var hour = parseInt(miltime/3600000);
    imsi = miltime%3600000;
    var min = parseInt(imsi/60000);
    imsi = imsi%60000;
    var sec = parseInt(imsi/1000);
    imsi = imsi%1000;
    var milli = imsi;
    var result = addZero(hour)+addZero(min)+addZero(sec)+addZeroMilli(milli);
    return result;
}

function now(){
    var date = new Date();
    var hours = addZero(date.getHours());
    var mins = addZero(date.getMinutes());
    var secs = addZero(date.getSeconds());
    var millis = addZeroMilli(date.getMilliseconds());
    var timeSum = hours+mins+secs+millis;
    return timeSum;
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

function getYearMonthDate(){
    var nowDate = new Date();

    var year = nowDate.getFullYear().toString();
    var month = nowDate.getMonth() + 1;
    var date = nowDate.getDate();

    year = year[2] + year[3];
    month = addZero(month);
    date = addZero(date);

    var result = year + month + date;
    return result;
}

module.exports = {
    convertToTime: convertToTime,
    addZero: addZero,
    now: now,
    getYearMonthDate: getYearMonthDate,
    convertToMilli: convertToMilli,
    nowMilli: nowMilli,
    millToTime: millToTime
}