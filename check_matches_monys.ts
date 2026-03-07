import { db } from "./server/db";
import { matches } from "./shared/schema";
import { or, ilike } from "drizzle-orm";

async function main() {
    const allMatches = await db.select().from(matches).where(
        or(
            ilike(matches.winnerId, "%1432804059%"),
            ilike(matches.loserId, "%1432804059%")
        )
    );

    console.log("MATCHES FOUND:");
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
