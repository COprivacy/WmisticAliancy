import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function clearChat() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const resBefore = await pgPool.query("SELECT count(*) FROM global_messages");
        console.log("Before:", resBefore.rows[0].count);
        await pgPool.query("DELETE FROM global_messages");
        const resAfter = await pgPool.query("SELECT count(*) FROM global_messages");
        console.log("After:", resAfter.rows[0].count);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
clearChat();
