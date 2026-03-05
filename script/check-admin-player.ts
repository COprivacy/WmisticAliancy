import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function checkAdminPlayer() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query("SELECT * FROM players WHERE account_id = '1792001576'");
        console.log("Admin player found:", res.rows.length > 0);
        if (res.rows.length > 0) {
            console.log("Player:", res.rows[0].game_name);
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
checkAdminPlayer();
