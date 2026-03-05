import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function fixMusicPaths() {
    const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pgPool.query("SELECT id, effect FROM rewards WHERE type = 'music'");
        for (const r of res.rows) {
            if (r.effect && !r.effect.endsWith('.mp3')) {
                const newPath = r.effect + '.mp3';
                console.log(`Updating ID ${r.id}: ${r.effect} -> ${newPath}`);
                await pgPool.query("UPDATE rewards SET effect = $1 WHERE id = $2", [newPath, r.id]);
            }
        }
        console.log("Paths fixed successfully.");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pgPool.end();
    }
}
fixMusicPaths();
