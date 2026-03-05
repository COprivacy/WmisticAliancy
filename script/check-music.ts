import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function checkPlayerMusic() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query("SELECT game_name, active_music FROM players WHERE active_music IS NOT NULL");
        console.log("Players with active music:", res.rows.length);
        res.rows.forEach(r => console.log(`Player: ${r.game_name}, Music: ${r.active_music}`));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
checkPlayerMusic();
