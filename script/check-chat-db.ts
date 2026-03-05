import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function checkChat() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query("SELECT count(*) FROM global_messages");
        console.log("Global messages count:", res.rows[0].count);
        const latest = await pgPool.query("SELECT * FROM global_messages ORDER BY created_at DESC LIMIT 5");
        latest.rows.forEach(r => console.log(`[${r.created_at}] ${r.author_name}: ${r.content}`));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
checkChat();
