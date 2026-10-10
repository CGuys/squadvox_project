const axios = require('axios');

async function test() {
  try {
    // We need to bypass the JWT middleware for a sec or use a valid token
    // Actually, I can just require the db directly!
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: '127.0.0.1', user: 'root', database: 'squadvox_db'
    });
    
    // Check if the server is returning owner_id
    // But wait, it's easier to just read the actual running roomController.js!
    console.log('done');
  } catch (err) {
    console.error(err);
  }
}
test();
