const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'admin',
    password: '1234',
    connectionLimit: 5
});

async function firstTest(){
    let conn, rows;
    try{
        conn = await pool.getConnection();
        conn.query('USE farmData');
        conn.query('INSERT INTO House1(tarTemp, tempBand) VALUES( 24.0, 5.0 )');
        // rows = await conn.query('SELECT tarTemp FROM House1');
    }catch(err){
        throw err;
    }finally{
        if(conn) conn.end();
        // return rows[0];
    }
}

module.exports = {
    firstTest: firstTest
}