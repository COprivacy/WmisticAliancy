import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function checkRewards() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query("SELECT id, name, effect, type FROM rewards WHERE type = 'music'");
        res.rows.forEach(r => console.log(`ID: ${r.id}, Name: ${r.name}, Effect: ${r.effect}`));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
checkRewards();
