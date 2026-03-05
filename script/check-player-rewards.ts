import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function checkPlayerRewards() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        // Find a player first
        const pRes = await pgPool.query("SELECT id, game_name FROM players LIMIT 1");
        if (pRes.rows.length === 0) {
            console.log("No players found.");
            return;
        }
        const player = pRes.rows[0];
        console.log(`Checking rewards for player: ${player.game_name} (ID: ${player.id})`);

        const rRes = await pgPool.query(`
            SELECT r.* FROM rewards r 
            JOIN player_rewards pr ON r.id = pr.reward_id 
            WHERE pr.player_id = $1
        `, [player.id]);

        console.log(`Found ${rRes.rows.length} rewards.`);
        rRes.rows.forEach(r => {
            console.log(`- [${r.id}] ${r.name} (Type: ${r.type}, Effect: ${r.effect})`);
        });
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
checkPlayerRewards();
