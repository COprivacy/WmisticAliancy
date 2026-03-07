import { db } from "./server/db";
import { matches } from "./shared/schema";
import { sql } from "drizzle-orm";

async function main() {
    const allMatches = await db.select().from(matches);

    console.log("ALL MATCHES IN DB:");
    for (const m of allMatches) {
        console.log(`ID: ${m.id}, Winner: [${m.winnerId}]-${m.winnerZone}, Loser: [${m.loserId}]-${m.loserZone}, Status: ${m.status}`);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
