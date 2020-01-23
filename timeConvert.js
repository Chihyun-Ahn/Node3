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
    getYearMonthDate: getYearMonthDate
}