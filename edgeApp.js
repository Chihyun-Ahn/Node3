//#####################################################
//                  초기화
//#####################################################

// 웹서버를 구현을 위한 라이브러리 및 변수 설정
var express = require('express');
var cors = require('cors');
var path = require('path');
var bodyParser = require('body-parser');
// var app = express();
var socketApp = express();
var dbConn = require('./mariadbConn');
const timeGetter = require('./timeConvert');
const portNum = 5000;
const socketPort = 7000;
var edgeDeadTimer = [0,0];
var sendProbe = [0,0];
var cloudAddress = 'http://223.194.33.67:10004';
var timesyncServer = require('timesync/server');

//소켓 만들기
var http = require('http').Server(socketApp);
var io = require('socket.io')(http);
var socketGlobal = 'none';

// var http2 = require('http').

//전역 변수로 데이터빈 객체 사용
var dataBean = require('./dataBean');
var sensorCount = 6; //온, 습도 센서 개수. 각 동당. 

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
const HIGH = 1;
const LOW = 0;
var commState = [HIGH, HIGH, HIGH];
var currentUser = 'none';
var userReqTime = 0;
//commState[0]: H1Fog, [1]: H2Fog, [2]: H1H2

//소켓캔 채널 스타트
channel.start();

//###########################################################################
//                                웹서버
//###########################################################################
//웹서버... json사용 및 인코딩... css파일 폴더 등록

socketApp.use(bodyParser.json());
socketApp.use(bodyParser.urlencoded({extended: true}));
socketApp.use(express.static('views/cssAndpics'));
socketApp.use('/socket.io', express.static('node_modules/socket.io'));
socketApp.use(cors());
socketApp.use('/timesync', timesyncServer.requestHandler);


//사용자 요청 처리(최소 접속)
socketApp.get('/', function(req,res){
    console.log("Get request arrived. index.html is sent.");
    res.sendFile(path.join(__dirname,'views','index.html'));
});

socketApp.get('/realdata.do', function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('/realdata.do: '+req.query.user);
    currentUser = req.query.user;
    userReqTime = req.query.userLoginClickTime;
    res.sendFile(path.join(__dirname,'views','realtimepage.html'));
});

socketApp.get('/controlpage.do', function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('/controlpage.do: '+req.query.user);
    currentUser = req.query.user;
    res.sendFile(path.join(__dirname,'views','controlpage.html'));
});

socketApp.get('test.do', function(req, res){
    console.log('#####################');
});

//사용자가 getData.do 요청을 보내면, 응답으로 데이터빈을 보냄. 
socketApp.post('/getData.do', function(req,res){
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
socketApp.post('/setData.do', function(req,res){
    console.log('setData.do request received.');
    dataBean.house[0].tarTemp   = req.body.house1TarTemp;
    dataBean.house[0].tempBand  = req.body.house1TempBand;
    dataBean.house[1].tarTemp   = req.body.house2TarTemp;
    dataBean.house[1].tempBand  = req.body.house2TempBand;
    res.sendFile(path.join(__dirname,'views','index.html'));
});


//소켓 연결시
io.on('connection', function(socket){
    socketGlobal = socket;
    console.log('Socket.io: user connected. CurrentUser: '+currentUser);
    socket.on('userWho', ()=>{
        socket.emit('userIs', currentUser);
    });
    socket.on('disconnect', function(){
        console.log('User '+currentUser+' disconnected.');
    });
    socket.on('house1GraphDataReq', function(){
        //사용자 정보와 함께, 1, 2동의 가장 최근 100개 데이터 전송
        dbConn.getGraphDataset('house1').catch(
            (err)=>{console.log(err)}
        ).then(
            (result)=>{
                socket.emit('house1GraphDataRes', {result,currentUser, userReqTime});        
            }
        );
    });
    socket.on('house2GraphDataReq', function(){
        //사용자 정보와 함께, 1, 2동의 가장 최근 100개 데이터 전송
        dbConn.getGraphDataset('house2').catch(
            (err)=>{console.log(err)}
        ).then(
            (result)=>{
                socket.emit('house2GraphDataRes', {result,currentUser});        
            }
        );
    });
    socket.on('userArrTimeHouse1', function(msgid){
        var userToFogArrTimeMilli = timeGetter.nowMilli(); 
        var fogDepTimeMilli = timeGetter.convertToMilli(dataBean.house[0].fogDepTime);
        if(dataBean.house[0].msgID==msgid){
            // console.log('userArrTimeHouse1 receivd. fogDepTimeMilli: '+fogDepTimeMilli);
            var rtt = userToFogArrTimeMilli - fogDepTimeMilli;
            var oneWayDelay = Math.round((rtt / 2.0));
            var estimatedUserArrTime = fogDepTimeMilli + oneWayDelay;
            dataBean.house[0].userArrTime = timeGetter.millToTime(estimatedUserArrTime);
            // console.log('edtimatedUAT: '+estimatedUserArrTime+' OWD: '+oneWayDelay+' userArrTime: '+dataBean.house[0].userArrTime);
            dbConn.insertUserArrTime(msgid, dataBean.house[0].userArrTime).catch(
                (err) =>{
                    console.log(err);
                }
            );
        }
    });
    socket.on('userArrTimeHouse2', function(msgid){
        var userToFogArrTimeMilli = timeGetter.nowMilli(); 
        var fogDepTimeMilli = timeGetter.convertToMilli(dataBean.house[1].fogDepTime);
        if(dataBean.house[1].msgID==msgid){
            var rtt = userToFogArrTimeMilli - fogDepTimeMilli;
            var oneWayDelay = Math.round((rtt / 2.0));
            var estimatedUserArrTime = fogDepTimeMilli + oneWayDelay;
            dataBean.house[1].userArrTime = timeGetter.millToTime(estimatedUserArrTime);
            dbConn.insertUserArrTime(msgid, dataBean.house[1].userArrTime).catch(
                (err) =>{
                    console.log(err);
                }
            );
        }
    });
    socket.on('house1SyncReqFromCloud', function(data){
        var cloudToFogArrTime = timeGetter.nowMilli();
        var fogDepTime = data.fogDepTime;
        var msgIDHere = data.msgID;
        var rtt = cloudToFogArrTime - fogDepTime;
        var oneWayDelayFogToCloud = Math.round(rtt / 2.0);
        var estimatedCloudArrTime = fogDepTime + oneWayDelayFogToCloud;

        if(dataBean.house[0].msgID==msgIDHere){
            dataBean.house[0].cloudArrTime = timeGetter.millToTime(estimatedCloudArrTime);
            dbConn.insertSingleData(dataBean.house[0].msgID, 'cloudArrTime', dataBean.house[0].cloudArrTime)
            .catch(function(err){console.log(err);});
            socket.emit('house1SyncResFromFog', dataBean); // Send dataBean, when estimatedCloudArrTime is saved.
        }else{
            console.log('house1SyncReqFromCloud: msgID does not match. Error. ');
        }
    });
    socket.on('house2SyncReqFromCloud', function(data){
        var cloudToFogArrTime = timeGetter.nowMilli();
        var fogDepTime = data.fogDepTime;
        var msgIDHere = data.msgID;
        var rtt = cloudToFogArrTime - fogDepTime;
        var oneWayDelayFogToCloud = Math.round(rtt / 2.0);
        var estimatedCloudArrTime = fogDepTime + oneWayDelayFogToCloud;

        if(dataBean.house[1].msgID==msgIDHere){
            dataBean.house[1].cloudArrTime = timeGetter.millToTime(estimatedCloudArrTime);
            dbConn.insertSingleData(dataBean.house[1].msgID, 'cloudArrTime', dataBean.house[1].cloudArrTime)
            .catch(function(err){console.log(err);});
            socket.emit('house2SyncResFromFog', dataBean); // Send dataBean, when estimatedCloudArrTime is saved.
        }else{
            console.log('house2SyncReqFromCloud: msgID does not match. Error. ');
        }
    });
    socket.on('realPageUserReq', function(realPageUserReq){
        socket.emit('realPageUserRes', realPageUserReq);
    });
});

//소켓용 리스너
http.listen(portNum, function(){
    console.log('listening on socketPort: '+portNum);
});

//클라우드 서버로부터 요청을 받을 시 처리할 부분
socketApp.post('/cloudRequest.do', function(req,res){
    console.log('Cloud sent a request.'+req.body.todo);

});

//##########################################################################################################
//                                      주요 함수 및 메인 기능
//##########################################################################################################

// CAN리스너에서, 메세지를 받을 때마다, 호출할 메인 함수. 
function edgeMain(houseName){

    // CAN메세지의 데이터를 데이터빈에 저장. 
    getSensorData(houseName);
    var houseNum = houseName[5] - 1; //1동은 0, 2동은 1.
    var i;

    var tempSum, humiSum, imsi1, imsi2, imsi3;
    tempSum = humiSum = 0.0;

    // 온도, 습도 총합 계산.
    for(i=0;i<sensorCount;i++){
        tempSum += parseFloat(dataBean.house[houseNum].temp[i]);
        humiSum += parseFloat(dataBean.house[houseNum].humid[i]);
    }

    //평균 온,습도 계산 후 데이터빈 저장
    dataBean.house[houseNum].avgTemp = ((tempSum)/sensorCount).toFixed(1);
    dataBean.house[houseNum].avgHumid = ((humiSum)/sensorCount).toFixed(1);
    console.log(houseNum+'동 평균온도:'+dataBean.house[houseNum].avgTemp+'평균습도:'+dataBean.house[houseNum].avgHumid);

    //환기량 계산 후 데이터빈 저장
    imsi1 = dataBean.house[houseNum].avgTemp;
    imsi2 = dataBean.house[houseNum].tarTemp;
    imsi3 = dataBean.house[houseNum].tempBand;
    dataBean.house[houseNum].ventilPer = Math.round(((imsi1-imsi2)/imsi3)*100);

    //환기량 기반하여 고온알람 저장
    if(dataBean.house[houseNum].ventilPer > 120){
        dataBean.house[houseNum].alarm = HIGH;
    }

    //계산된 환기량에 근거, 팬 제어값 저장
    if(dataBean.house[houseNum].fanMode == 0){
        if(dataBean.house[houseNum].ventilPer < 33){
            dataBean.house[houseNum].fan1 = HIGH;
            dataBean.house[houseNum].fan2 = LOW;
            dataBean.house[houseNum].fan3 = LOW;
        }else if(dataBean.house[houseNum].ventilPer >= 33 && dataBean.house[houseNum].ventilPer < 66){
            dataBean.house[houseNum].fan1 = HIGH;
            dataBean.house[houseNum].fan2 = HIGH;
            dataBean.house[houseNum].fan3 = LOW;
        }else if(dataBean.house[houseNum].ventilPer >= 66){
            dataBean.house[houseNum].fan1 = HIGH;
            dataBean.house[houseNum].fan2 = HIGH;
            dataBean.house[houseNum].fan3 = HIGH;
        }
    };
    //습도에 따른 가습기 제어
    if(dataBean.house[houseNum].waterMode == 0){
        if(dataBean.house[houseNum].avgHumid < 50){
            dataBean.house[houseNum].water = HIGH;
        }else if(dataBean.house[houseNum].avgHumid > 70){
            dataBean.house[houseNum].water = LOW;
        }
    }

    console.log('제어 정보 갱신됨.데이터빈을 로컬DB에 저장합니다.');
    dbConn.insertData(dataBean, houseNum).catch(
        (err) =>{
            console.log(err);
        }
    );

    //제어 데이터를 농장 각 동으로 전송
    if(houseName=="House1"){
        db.messages["House1Ctrl"].signals["fan1"].update(dataBean.house[0].fan1);
        db.messages["House1Ctrl"].signals["fan2"].update(dataBean.house[0].fan2);
        db.messages["House1Ctrl"].signals["fan3"].update(dataBean.house[0].fan3);
        db.messages["House1Ctrl"].signals["water"].update(dataBean.house[0].water);
        db.messages["House1Ctrl"].signals["alarm"].update(dataBean.house[0].alarm);
        db.send("House1Ctrl");
        console.log('1동 제어 정보 매 동에 전송 완료');
    }else if(houseName=="House2"){
        db.messages["House2Ctrl"].signals["fan1"].update(dataBean.house[1].fan1);
        db.messages["House2Ctrl"].signals["fan2"].update(dataBean.house[1].fan2);
        db.messages["House2Ctrl"].signals["fan3"].update(dataBean.house[1].fan3);
        db.messages["House2Ctrl"].signals["water"].update(dataBean.house[1].water);
        db.messages["House2Ctrl"].signals["alarm"].update(dataBean.house[1].alarm);
        db.send("House2Ctrl");
        console.log('2동 제어 정보 매 동에 전송 완료');
    }
};


// 캔 메세지를 받아서 데이터빈에 저장하는 함수. 
function getSensorData(houseName){
    var houseTemp = houseName + "Temp";
    var houseHumid = houseName + "Humid";
    var tempera = "temperature";
    var humi = "humidity";
    var houseNum = houseName[5]*1 - 1; //하우스 동번호. 형변환
    var i;
    for(i=0;i<sensorCount;i++){
        var senNum = i+1;
        dataBean.house[houseNum].temp[i] = ((db.messages[houseTemp].signals[tempera+senNum].value)/10).toFixed(1); 
        dataBean.house[houseNum].humid[i] = ((db.messages[houseHumid].signals[humi+senNum].value)/10).toFixed(1); 
        console.log(houseName+" "+tempera+senNum+": "+dataBean.house[houseNum].temp[i]+" | "+humi+senNum+": "+dataBean.house[houseNum].humid[i]);
    }
}

setEdgeDeadTimer('House1');
setEdgeDeadTimer('House2');

function setEdgeDeadTimer(houseName){
    var houseNum = houseName[5] - 1;
    var i = 1;
    var aliveCheck, houseAskingByFog;
    if(houseNum == 0){
        aliveCheck = 'AliveCheckH1ByFog';
        houseAskingByFog = 'H1AskingByFog';
    }else if(houseNum == 1){
        aliveCheck = 'AliveCheckH2ByFog';
        houseAskingByFog = 'H2AskingByFog';
    }
    edgeDeadTimer[houseNum] = setTimeout(function(){
        console.log('!!WARNING! '+houseName+' is not responding for 30s.');
        console.log('aliveCheck message: '+aliveCheck);
        db.send(aliveCheck);
        console.log('Probe'+i+'has been sent.');
        sendProbe[houseNum] = setInterval(function(){
            i++;
            if(i<=3){
                db.send(aliveCheck);
                console.log('Probe '+i+'has been sent.');
            }else if(i>3 && i<6){
                commState[houseNum] = LOW; // House -- Fog comm. LOW. 
                db.send(houseAskingByFog);
                console.log('House'+(houseNum+1)+' not responding. Probe '+(i-3)+' is sent to the neighbor.');
            }else if(i>=6){
                console.log('House'+(houseNum+1)+' and neighbor are both dead. State is changed to LOW.');
                commState[0] = LOW;
                commState[1] = LOW;
                clearInterval(sendProbe[houseNum]);
            }
        }, 10000)
    }, 30000);
}

//##########################################################################################################
//                                           캔 메세지 리스너
//##########################################################################################################

var house1MsgNum=0;
var house2MsgNum=0;

//CAN메세지 리스너. 1동(Edge 1)
db.messages["House1MsgNum"].signals["msgNum"].onUpdate(function(s) {
    var fogArrTimeMilli = timeGetter.nowMilli();
    dataBean.house[0].fogArrTime = timeGetter.millToTime(fogArrTimeMilli);
    house1MsgNum = s.value;
    db.messages["timeSyncReqToH1"].signals["fogTime"].update(fogArrTimeMilli);
    db.messages["timeSyncReqToH1"].signals["msgNum"].update(house1MsgNum);
    db.send("timeSyncReqToH1");
});

db.messages["timeSyncResH1"].signals["msgNum"].onUpdate(function(s){
    var msgNumImsi = s.value;
    if(house1MsgNum==msgNumImsi){
        dataBean.house[0].edgeDepTime = timeGetter.millToTime(db.messages["timeSyncResH1"].signals["edgeDepTimeCalib"].value);
        dataBean.house[0].msgID = 'h1' + timeGetter.getYearMonthDate() + dataBean.house[0].edgeDepTime.substr(0,6);
        clearTimeout(edgeDeadTimer[0]);
        console.log('edgeDeadTimer[0] is reset.');
        setEdgeDeadTimer('House1');
        edgeMain("House1");
        if(socketGlobal != 'none'){
            dataBean.house[0].fogDepTime = timeGetter.now();
            socketGlobal.emit('house1Msg', dataBean);
        }
    }
});
 
//CAN메세지 리스너. 2동(Edge 2)
db.messages["House2MsgNum"].signals["msgNum"].onUpdate(function(s) {
    console.log('House2MsgNum received. msgNum: '+s.value);
    var fogArrTimeMilli = timeGetter.nowMilli();
    dataBean.house[1].fogArrTime = timeGetter.millToTime(fogArrTimeMilli);
    house2MsgNum = s.value;
    db.messages["timeSyncReqToH2"].signals["fogTime"].update(fogArrTimeMilli);
    db.messages["timeSyncReqToH2"].signals["msgNum"].update(house2MsgNum);
    db.send("timeSyncReqToH2");
});

db.messages["timeSyncResH2"].signals["msgNum"].onUpdate(function(s){
    console.log('timeSyncResH2 received. msgNum: '+s.value);
    var msgNumImsi = s.value;
    if(house2MsgNum==msgNumImsi){
        dataBean.house[1].edgeDepTime = timeGetter.millToTime(db.messages["timeSyncResH2"].signals["edgeDepTimeCalib"].value);
        dataBean.house[1].msgID = 'h2' + timeGetter.getYearMonthDate() + dataBean.house[1].edgeDepTime.substr(0,6);
        clearTimeout(edgeDeadTimer[1]);
        console.log('edgeDeadTimer[1] is reset.');
        setEdgeDeadTimer('House2');
        edgeMain("House2");
        if(socketGlobal != 'none'){
            dataBean.house[1].fogDepTime = timeGetter.now();
            socketGlobal.emit('house2Msg', dataBean);
        }
    }else if(house2MsgNum!=msgNumImsi){
        console.log('house2MsgNum different. received msgNum: '+msgNumImsi);
    }else{
        console.log('####Error.house2MsgNum strange.');
    }
});

db.messages['AliveAnsToFogByH1'].signals['nodeID'].onUpdate(function(){
    clearInterval(sendProbe[0]);
    setEdgeDeadTimer('House1');
    dataBean.house[0].state = 1;
    console.log('Edge1 is recovered. Databean state value is alive.');
});
 
db.messages['AliveAnsToFogByH2'].signals['nodeID'].onUpdate(function(){
    clearInterval(sendProbe[1]);
    setEdgeDeadTimer('House2');
    dataBean.house[1].state = 1;
    console.log('Edge2 is recovered. Databean state value is alive.');
});

db.messages['H1StateByH2'].signals['state'].onUpdate(function(s){
    var stateWord = (s.value)?'fine':'in failure'
    console.log('Neighbor report: house1 state is '+stateWord+'. state value saved to commState.H1H2');
    clearInterval(sendProbe[0]);
    commState[2] = s.value;
});

db.messages['H2StateByH1'].signals['state'].onUpdate(function(s){
    var stateWord = (s.value)?'fine':'in failure'
    console.log('Neighbor report: house2 state is '+stateWord+'. state value saved to commState.H1H2');
    clearInterval(sendProbe[1]);
    commState[2] = s.value;
});

db.messages['H1AskingByH2'].signals['nodeID'].onUpdate(function(){
    commState[2] = LOW;
    db.messages['H1StateByFog'].signals['state'].update(commState[0]);
    console.log('H1StateByFog>>state>>commState[0]: '+ commState[0]);
    db.send('H1StateByFog');
});

db.messages['H2AskingByH1'].signals['nodeID'].onUpdate(function(){
    commState[2] = LOW;
    db.messages['H2StateByFog'].signals['state'].update(commState[1]);
    console.log('H2StateByFog>>state>>commState[1]: '+ commState[1]);
    db.send('H2StateByFog');
});

