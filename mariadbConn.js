const mariadb = require('mariadb');
const timeConv = require('./timeConvert');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'admin',
    password: '1234',
    connectionLimit: 5
});

async function insertData(dataBean, houseNum){
    let conn;
    var sql1 = 'INSERT INTO house1(msgID, edgeDepTime, fogArrTime, fogDepTime, '+
        'userArrTime, tarTemp, tempBand, ventilPer, temp1, temp2, temp3, '+
        'temp4, temp5, temp6, humid1, humid2, humid3, humid4, humid5, humid6, '+
        'fanMode, fan1, fan2, fan3, waterMode, water, alarm) '+
        'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        var sql2 = 'INSERT INTO house2(msgID, edgeDepTime, fogArrTime, fogDepTime, '+
        'userArrTime, tarTemp, tempBand, ventilPer, temp1, temp2, temp3, '+
        'temp4, temp5, temp6, humid1, humid2, humid3, humid4, humid5, humid6, '+
        'fanMode, fan1, fan2, fan3, waterMode, water, alarm) '+
        'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';    
    var sql = [sql1, sql2];
    try{
        conn = await pool.getConnection();
        conn.query('Use farmData');
        conn.query(sql[houseNum],
            [
                dataBean.house[houseNum].msgID,        dataBean.house[houseNum].edgeDepTime, 
                dataBean.house[houseNum].fogArrTime,   dataBean.house[houseNum].fogDepTime,
                dataBean.house[houseNum].userArrTime,  dataBean.house[houseNum].tarTemp,
                dataBean.house[houseNum].tempBand,     dataBean.house[houseNum].ventilPer,
                dataBean.house[houseNum].temp[0],      dataBean.house[houseNum].temp[1],
                dataBean.house[houseNum].temp[2],      dataBean.house[houseNum].temp[3],
                dataBean.house[houseNum].temp[4],      dataBean.house[houseNum].temp[5],
                dataBean.house[houseNum].humid[0],     dataBean.house[houseNum].humid[1],
                dataBean.house[houseNum].humid[2],     dataBean.house[houseNum].humid[3],
                dataBean.house[houseNum].humid[4],     dataBean.house[houseNum].humid[5],
                dataBean.house[houseNum].fanMode,      dataBean.house[houseNum].fan[0],
                dataBean.house[houseNum].fan[1],       dataBean.house[houseNum].fan[2],
                dataBean.house[houseNum].waterMode,    dataBean.house[houseNum].water,
                dataBean.house[houseNum].alarm
            ]
        );
    }catch(err){
        console.log(err);
    }finally{
        if(conn) conn.end();
    }
}

async function insertUserArrTime(msgid, userarrtime){
    var houseName = 'house' + msgid[1];
    console.log('mariadbConn.js: houseName: '+houseName);
    var msgID = msgid;
    var userArrTime = userarrtime;
    let conn;
    try{
        conn = await pool.getConnection();
        conn.query('Use farmData');
        var sql = 'UPDATE '+houseName+' SET userArrTime = ? WHERE msgID = ?';
        conn.query(sql, [userArrTime, msgID]);
    }catch(err){
        console.log(err);
    }finally{
        if(conn) conn.end();
    }
}

async function insertSingleData(msgid, singleDataName, singleDataValue){
    var houseName = 'house' + msgid[1];
    console.log('mariadbConn.js: houseName: '+houseName);
    let conn;
    try{
        conn = await pool.getConnection();
        conn.query('Use farmData');
        var sql = 'UPDATE '+houseName+' SET '+singleDataName+'=? WHERE msgID=?';
        conn.query(sql, [singleDataValue, msgid]);
    }catch(err){
        console.log(err);
    }finally{
        if(conn) conn.end();
    }
}

async function getGraphDataset(house){
    let conn, result;
    var sql = 'SELECT * FROM '+house+' ORDER BY num DESC LIMIT 100';
    try{
        conn = await pool.getConnection();
        await conn.query('Use farmData');
        result = await conn.query(sql);
    }catch(err){
        console.log(err);
    }finally{
        if(conn) conn.end();
        // console.log(result[0].temp1);
        return result;
    }
}

async function insertResponseTime(resTimeTestResult, currentTime){
    let conn;
    var sql = 'INSERT INTO responseTime(currentTime, responseTime) '+
                'VALUES(?,?)';
    try{
        conn = await pool.getConnection();
        conn.query('use farmData');
        conn.query(sql, [currentTime, resTimeTestResult]);
    }catch(err){
        console.log(err);
    }finally{
        if(conn) conn.end();
    }
}

module.exports = {
    insertData: insertData,
    insertUserArrTime: insertUserArrTime,
    getGraphDataset: getGraphDataset,
    insertSingleData: insertSingleData,
    insertResponseTime:insertResponseTime
};
