import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function findOrphanedRewards() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query(`
            SELECT pr.id, pr.player_id, pr.reward_id 
            FROM player_rewards pr 
            LEFT JOIN rewards r ON pr.reward_id = r.id 
            WHERE r.id IS NULL
        `);
        console.log(`Found ${res.rows.length} orphaned entries in player_rewards (pointing to non-existent rewards).`);
        res.rows.forEach(r => console.log(r));

        const activeCheck = await pgPool.query(`
            SELECT id, game_name, active_frame, active_background, active_music FROM players
        `);
        console.log("\n--- Active Items Check ---");
        for (const p of activeCheck.rows) {
            console.log(`Player: ${p.game_name}`);
            if (p.active_frame) console.log(`  - Frame: ${p.active_frame}`);
            if (p.active_background) console.log(`  - Background: ${p.active_background}`);
            if (p.active_music) console.log(`  - Music: ${p.active_music}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pgPool.end();
    }
}
findOrphanedRewards();
