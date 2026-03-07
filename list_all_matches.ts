import { db } from "./server/db";
import { matches } from "./shared/schema";

async function main() {
    const allMatches = await db.select().from(matches);

    console.log("ALL MATCHES:");
    for (const m of allMatches) {
        console.log({
            id: m.id,
            winnerId: `[${m.winnerId}]`,
            winnerZone: `[${m.winnerZone}]`,
            loserId: `[${m.loserId}]`,
            loserZone: `[${m.loserZone}]`,
            status: m.status
        });
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
