import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function listAllRewards() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query("SELECT id, name, type FROM rewards ORDER BY id");
        console.log("--- All Rewards in DB ---");
        res.rows.forEach(r => console.log(`[${r.id}] ${r.name} (${r.type})`));
    } catch (e) {
        console.error(e);
    } finally {
        await pgPool.end();
    }
}
listAllRewards();
