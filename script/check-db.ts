import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function checkTables() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        res.rows.forEach(r => console.log(`TABLE: ${r.table_name}`));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
checkTables();
