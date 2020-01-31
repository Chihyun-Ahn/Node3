const express = require('express');
const app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

const portNum = 6000;

http.listen(6000, function(){
    console.log('listening on port: '+portNum);
});

io.on('connection', (socket)=>{
    console.log('Socket connected.');
    socket.on('disconnect',()=>{
        console.log('Socket disconnected.');
    });
    socket.on('haha', (data)=>{
        console.log(data.user);
        socket.emit('answer', {answer: 'hoho'});
    });
});

// var mariadb = require('mariadb');
// var dbConn = require('./mariadbConn');
// const pool = mariadb.createPool({
//     host: 'localhost',
//     user: 'admin',
//     password: '1234',
//     connectionLimit: 5
// });

// selectData('house1').catch(
//     (err)=>{
//         console.log(err);
//     }
// ).then(
//     (result)=>{
//         console.log(result[0].temp1);
//     }
// );

// async function selectData(house){
//     let conn, result;
//     var sql = 'SELECT * FROM '+house+' ORDER BY num DESC LIMIT 10';
//     try{
//         conn = await pool.getConnection();
//         await conn.query('Use farmData');
//         result = await conn.query(sql);
//         //return result;
//         //console.log(result[0].temp1);
//     }catch(err){
//         console.log(err);
//     }finally{
//         if(conn) conn.end();
//         //console.log('connection ended.');
//         console.log(result[0].temp1);
//         console.log(result[1].temp1);
//         return result;
//     }
//     //console.log(result[0].temp1);
// }



// // var timeVector = [5,5,5,5,5];


// // setInterval(()=>{
// //     for(i=0;i<5;i++){
// //         if(i<4){
// //             timeVector[i] = timeVector[i+1];
// //         }else if(i==4){
// //             timeVector[i] = 0;
// //         }
// //     }
// //     console.log(timeVector);
// // }, 1000);
