import pg from 'pg';
import "dotenv/config";

async function dump() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const players = await pool.query("SELECT * FROM players");
    console.log("Total players in Postgres:", players.rows.length);
    console.log(players.rows);

    const activities = await pool.query("SELECT * FROM activities ORDER BY created_at DESC LIMIT 10");
    console.log("Recent activities:", activities.rows);

    await pool.end();
}
dump().catch(console.error);
