// 웹서버를 구현을 위한 라이브러리 및 변수 설정
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var dbConn = require('./mariadbConn');
const portNum = 5000;

//전역 변수로 데이터빈 객체 사용
var dataBean = require('./dataBean');

//캔버스 can0 활성화하기
var exec = require('child_process').exec;
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

//소켓캔의 파싱
var network = can.parseNetworkDescription("./node_modules/socketcan/samples/mycan_definition.kcd");
var channel = can.createRawChannel("can0");
var db = new can.DatabaseService(channel, network.buses["FarmBUS"]);

//소켓캔 채널 스타트
channel.start();

//캔통신 리스너 등록
//캔 메세지 받으면 데이터빈에 저장 
db.messages["House1Stat"].signals["temperature1"].onUpdate(function(s) {
    dataBean.house[0].temp1 = s.value;
    console.log("House1 temp1: " + dataBean.house[0].temp1);
 });
 db.messages["House1Stat"].signals["temperature2"].onUpdate(function(s) {
    dataBean.house[0].temp2 = s.value;
    console.log("House1 temp2: " + dataBean.house[0].temp2);
 });
 db.messages["House1Stat"].signals["humidity1"].onUpdate(function(s) {
    dataBean.house[0].humid1 = s.value;
    console.log("House1 humid1: " + dataBean.house[0].humid1);
 });
 db.messages["House1Stat"].signals["humidity2"].onUpdate(function(s) {
    dataBean.house[0].humid2 = s.value;
    console.log("House1 humid2: " + dataBean.house[0].humid2);
 });
 db.messages["House1Stat"].signals["sigTime"].onUpdate(function(s) {
    dataBean.house[0].msgTime = s.value;
    console.log("House1 time: " + dataBean.house[0].msgTime);
 });
 
 db.messages["House2Stat"].signals["temperature1"].onUpdate(function(s) {
    dataBean.house[1].temp1 = s.value;
    console.log("House2 temp1: " + dataBean.house[1].temp1);
 });
 db.messages["House2Stat"].signals["temperature2"].onUpdate(function(s) {
    dataBean.house[1].temp2 = s.value;
    console.log("House2 temp2: " + dataBean.house[1].temp2);
 });
 db.messages["House2Stat"].signals["humidity1"].onUpdate(function(s) {
    dataBean.house[1].humid1 = s.value;
    console.log("House2 humid1: " + dataBean.house[1].humid1);
 });
 db.messages["House2Stat"].signals["humidity2"].onUpdate(function(s) {
    dataBean.house[1].humid2 = s.value;
    console.log("House2 humid2: " + dataBean.house[1].humid2);
 });
 db.messages["House2Stat"].signals["sigTime"].onUpdate(function(s) {
    dataBean.house[1].msgTime = s.value;
    console.log("House2 time: " + dataBean.house[1].msgTime);
 });
//여기까지는,,, 농장의 정보를 받아서 온도, 습도 정보를 houseSensor라는 객체에 저장을 했다. 

//기본 센서 수치를 받았으니, 이제,,
//매 10초마다 센서수치에 기반하여 제어 정보 계산
setInterval(()=>{
    var imsi1,imsi2,imsi3,imsi4;
    for(i=0;i<2;i++){
        //먼저 온도, 습도의 평균값 계산 및 데이터빈 저장
        imsi1 = dataBean.house[i].temp1;
        imsi2 = dataBean.house[i].temp2;
        imsi3 = dataBean.house[i].humid1;
        imsi4 = dataBean.house[i].humid2;
        dataBean.house[i].avgTemp = Math.round((imsi1+imsi2)/2);
        console.log('평균온도:'+dataBean.house[i].avgTemp);
        dataBean.house[i].avgHumid = Math.round((imsi3+imsi4)/2);

        //그 다음은 환기량 계산
        imsi1 = dataBean.house[i].avgTemp;
        imsi2 = dataBean.house[i].tarTemp;
        imsi3 = dataBean.house[i].tempBand;
        dataBean.house[i].ventilPer = Math.round(((imsi1-imsi2)/imsi3)*100);

        //환기량 기반하여 고온알람 저장
        if(dataBean.house[i].ventilPer > 120){
            dataBean.house[i].alarm = 1;
        }

        //계산된 환기량에 근거, 팬 제어값 저장
        if(dataBean.house[i].fanMode == 0){
            if(dataBean.house[i].ventilPer < 33){
                dataBean.house[i].fan1 = 1;
                dataBean.house[i].fan2 = 0;
                dataBean.house[i].fan3 = 0;
            }else if(dataBean.house[i].ventilPer >= 33 && dataBean.house[i].ventilPer < 66){
                dataBean.house[i].fan1 = 1;
                dataBean.house[i].fan2 = 1;
                dataBean.house[i].fan3 = 0;
            }else if(dataBean.house[i].ventilPer >= 66){
                dataBean.house[i].fan1 = 1;
                dataBean.house[i].fan2 = 1;
                dataBean.house[i].fan3 = 1;
            }
        };

        //습도에 따른 가습기 제어
        if(dataBean.house[i].waterMode == 0){
            if(dataBean.house[i].avgHumid < 50){
                dataBean.house[i].water = 1;
            }else if(dataBean.house[i].avgHumid > 70){
                dataBean.house[i].water = 0;
            }
        }
    }
    console.log('제어 정보 갱신됨.데이터빈을 로컬DB에 저장합니다.');
    dbConn.insertData(dataBean).catch(
        (err) =>{
            console.log(err);
        }
    );

    // dbConn.selectData('house1').catch(
    //     (err) => {
    //         console.log(err);
    //     }
    // ).then((result)=>{
    //     dataBean.house[0].
        
    //     console.log(result[0].temp1);
    // });

    //제어 데이터를 농장 각 동으로 전송
    db.messages["House1Ctrl"].signals["fan1"].update(dataBean.house[0].fan1);
    db.messages["House1Ctrl"].signals["fan2"].update(dataBean.house[0].fan2);
    db.messages["House1Ctrl"].signals["fan3"].update(dataBean.house[0].fan3);
    db.messages["House1Ctrl"].signals["water"].update(dataBean.house[0].water);
    db.messages["House1Ctrl"].signals["alarm"].update(dataBean.house[0].alarm);
    db.send("House1Ctrl");
    db.messages["House2Ctrl"].signals["fan1"].update(dataBean.house[1].fan1);
    db.messages["House2Ctrl"].signals["fan2"].update(dataBean.house[1].fan2);
    db.messages["House2Ctrl"].signals["fan3"].update(dataBean.house[1].fan3);
    db.messages["House2Ctrl"].signals["water"].update(dataBean.house[1].water);
    db.messages["House2Ctrl"].signals["alarm"].update(dataBean.house[1].alarm);
    db.send("House2Ctrl");
    console.log('제어 정보 매 동에 전송 완료');
},10000);

//이제 웹서버 부분
//웹서버... json사용 및 인코딩... css파일 폴더 등록
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('views/cssAndpics'));

//사용자 요청 처리(최소 접속)
app.get('/', function(req,res){
    console.log("Get request arrived. index.html is sent.");
    res.sendFile(path.join(__dirname,'views','index.html'));
});

//사용자가 getData.do 요청을 보내면, 응답으로 데이터빈을 보냄. 
app.post('/getData.do', function(req,res){
    console.log('getData.do request received.');
    if(req.body.userData.userData1.fanMode == 1){
        dataBean.house[0].fanMode   = req.body.userData.userData1.fanMode;
        dataBean.house[0].fan1      = req.body.userData.userData1.fan1;
        dataBean.house[0].fan2      = req.body.userData.userData1.fan2;
        dataBean.house[0].fan3      = req.body.userData.userData1.fan3;
    }

    if(req.body.userData.userData2.fanMode == 1){
        dataBean.house[1].fanMode   = req.body.userData.userData2.fanMode;
        dataBean.house[1].fan1      = req.body.userData.userData2.fan1;
        dataBean.house[1].fan2      = req.body.userData.userData2.fan2;
        dataBean.house[1].fan3      = req.body.userData.userData2.fan3;
    }

    if(req.body.userData.userData1.waterMode == 1){
        dataBean.house[0].waterMode = req.body.userData.userData1.waterMode;
        dataBean.house[0].water     = req.body.userData.userData1.water;
    }
    if(req.body.userData.userData2.waterMode == 1){
        dataBean.house[1].waterMode = req.body.userData.userData2.waterMode;
        dataBean.house[1].water     = req.body.userData.userData2.water;
    }
    res.send(dataBean);
});

//사용자가 설정value을 입력하면, 그것에 대한 응답. 
app.post('/setData.do', function(req,res){
    console.log('setData.do request received.');
    dataBean.house[0].tarTemp   = req.body.house1TarTemp;
    dataBean.house[0].tempBand  = req.body.house1TempBand;
    dataBean.house[1].tarTemp   = req.body.house2TarTemp;
    dataBean.house[1].tempBand  = req.body.house2TempBand;
    res.sendFile(path.join(__dirname,'views','index.html'));
});

//사용자용 리스너
app.listen(portNum, function(){
    console.log('listening on port:'+portNum);
});

//클라우드 서버로부터 요청을 받을 시 처리할 부분
app.post('/cloudRequest.do', function(req,res){
    console.log('Cloud sent a request.'+req.body.todo);

});