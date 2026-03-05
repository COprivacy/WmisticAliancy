import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function checkColumns() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'global_messages'
        `);
        res.rows.forEach(r => console.log(`COLUMN: ${r.column_name} (${r.data_type})`));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
checkColumns();
