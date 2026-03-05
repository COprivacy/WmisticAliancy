import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function fixMusic() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        // Fix rewarding entry
        await pgPool.query("UPDATE rewards SET effect = '/uploads/custom/audio1.mp3' WHERE effect = '/uploads/custom/audio1'");
        // Fix players currently using it
        await pgPool.query("UPDATE players SET active_music = '/uploads/custom/audio1.mp3' WHERE active_music = '/uploads/custom/audio1'");
        console.log("Music entries fixed (added .mp3 extension).");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
fixMusic();
