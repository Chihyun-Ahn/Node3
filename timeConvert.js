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

function addZero(num){
    var n = num.toString();
    var x = (n<10)?("0"+n):(""+n);
    return x;
}

module.exports = {
    convertToTime: convertToTime,
    addZero: addZero
}