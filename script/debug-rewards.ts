import pkg from 'pg';
const { Pool } = pkg;
import { writeFileSync } from 'fs';
import "dotenv/config";

async function listAllRewards() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query("SELECT id, name, type, effect FROM rewards WHERE type = 'music'");
        let output = `FOUND ${res.rows.length} MUSIC REWARDS\n`;
        res.rows.forEach(r => {
            output += `ID: ${r.id} | NAME: ${r.name} | EFFECT: ${r.effect}\n`;
        });
        writeFileSync('music_debug_final.txt', output);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
listAllRewards();
