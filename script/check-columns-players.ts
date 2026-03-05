import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function checkColumns() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'players'
            ORDER BY column_name
        `);
        console.log(`Total columns: ${res.rows.length}`);
        for (const r of res.rows) {
            console.log(`|${r.column_name}|${r.data_type}|`);
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
checkColumns();
