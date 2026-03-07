import { db } from "./server/db";
import { players } from "./shared/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const allPlayers = await db.select().from(players).where(ilike(players.gameName, "%3220%"));
    for (const p of allPlayers) {
        console.log(`ID: ${p.id}, accountId: '${p.accountId}', zoneId: '${p.zoneId}'`);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
