import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function repairDatabase() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        console.log("--- Starting Database Repair ---");

        // 1. Remove Orphans
        const orphans = await pgPool.query(`
            DELETE FROM player_rewards 
            WHERE reward_id NOT IN (SELECT id FROM rewards)
            RETURNING *
        `);
        console.log(`Cleaned up ${orphans.rows.length} orphaned reward assignments.`);

        // 2. Re-grant core items based on active status if they are missing
        const players = await pgPool.query("SELECT id, game_name, active_frame, active_background, active_music FROM players");
        const rewards = await pgPool.query("SELECT id, effect FROM rewards");

        for (const p of players.rows) {
            const owned = await pgPool.query("SELECT reward_id FROM player_rewards WHERE player_id = $1", [p.id]);
            const ownedIds = new Set(owned.rows.map(o => o.reward_id));

            // Check if active items are in owned list
            const checkAndGrant = async (effect: string) => {
                if (!effect) return;
                const match = rewards.rows.find(r => r.effect === effect);
                if (match && !ownedIds.has(match.id)) {
                    console.log(`Granting missing ownership for active item: ${match.id} to player ${p.game_name}`);
                    await pgPool.query("INSERT INTO player_rewards (player_id, reward_id, assigned_at) VALUES ($1, $2, NOW())", [p.id, match.id]);
                }
            };

            await checkAndGrant(p.active_frame);
            await checkAndGrant(p.active_background);
            await checkAndGrant(p.active_music);
        }

        // 3. Ensure Welcome Relic for everyone
        const welcome = await pgPool.query("SELECT id FROM rewards WHERE name = 'Selo de Sangue da Aliança' LIMIT 1");
        if (welcome.rows.length > 0) {
            const welcomeId = welcome.rows[0].id;
            for (const p of players.rows) {
                const check = await pgPool.query("SELECT 1 FROM player_rewards WHERE player_id = $1 AND reward_id = $2", [p.id, welcomeId]);
                if (check.rows.length === 0) {
                    console.log(`Auto-granting Welcome Relic to ${p.game_name}`);
                    await pgPool.query("INSERT INTO player_rewards (player_id, reward_id, assigned_at) VALUES ($1, $2, NOW())", [p.id, welcomeId]);
                }
            }
        }

        console.log("--- Repair Complete ---");
    } catch (e) {
        console.error(e);
    } finally {
        await pgPool.end();
    }
}
repairDatabase();
