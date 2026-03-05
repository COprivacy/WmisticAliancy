import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function checkAllPlayerRewards() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query(`
            SELECT p.game_name, p.id as player_id, r.id as reward_id, r.name, r.type
            FROM players p
            JOIN player_rewards pr ON p.id = pr.player_id
            JOIN rewards r ON pr.reward_id = r.id
            ORDER BY p.id, r.id
        `);

        console.log("--- Player Rewards Dump ---");
        res.rows.forEach(row => {
            console.log(`Player: ${row.game_name} | ID: ${row.reward_id} | Name: ${row.name} | Type: ${row.type}`);
        });

        // Count duplicates per player
        const counts = await pgPool.query(`
            SELECT p.game_name, r.name, COUNT(*) as qty
            FROM players p
            JOIN player_rewards pr ON p.id = pr.player_id
            JOIN rewards r ON pr.reward_id = r.id
            GROUP BY p.game_name, r.name
            HAVING COUNT(*) > 1
        `);

        if (counts.rows.length > 0) {
            console.log("\n--- Duplicates Found ---");
            counts.rows.forEach(c => {
                console.log(`Player ${c.game_name} has ${c.qty}x "${c.name}"`);
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pgPool.end();
    }
}
checkAllPlayerRewards();
