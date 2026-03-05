const { Pool } = require('pg');
require('dotenv').config();

async function run() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const res = await pool.query("SELECT id, name, type, effect FROM rewards WHERE type = 'music'");
    console.log(JSON.stringify(res.rows, null, 2));
    await pool.end();
}
run();
