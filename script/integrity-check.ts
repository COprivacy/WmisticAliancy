import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function deepIntegrityCheck() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const orphans = await pgPool.query(`
            SELECT pr.id, p.game_name, pr.reward_id 
            FROM player_rewards pr
            JOIN players p ON pr.player_id = p.id
            LEFT JOIN rewards r ON pr.reward_id = r.id
            WHERE r.id IS NULL
        `);

        console.log(`--- Integrity Check Results ---`);
        console.log(`Total Orphans: ${orphans.rows.length}`);
        orphans.rows.forEach(o => {
            console.log(`Player: ${o.game_name} owns non-existent reward ID: ${o.reward_id}`);
        });

        const mismatchedActive = await pgPool.query(`
            SELECT p.id, p.game_name, p.active_frame, p.active_background, p.active_music
            FROM players p
        `);

        console.log(`\n--- Active Items vs Rewards Table ---`);
        const allRewards = await pgPool.query("SELECT effect, name FROM rewards");
        const effectMap = new Set(allRewards.rows.map(r => r.effect));

        for (const p of mismatchedActive.rows) {
            if (p.active_frame && !effectMap.has(p.active_frame)) console.log(`[!] ${p.game_name} has unknown Frame: ${p.active_frame}`);
            if (p.active_background && !effectMap.has(p.active_background)) console.log(`[!] ${p.game_name} has unknown Background: ${p.active_background}`);
            if (p.active_music && !effectMap.has(p.active_music)) console.log(`[!] ${p.game_name} has unknown Music: ${p.active_music}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pgPool.end();
    }
}
deepIntegrityCheck();
