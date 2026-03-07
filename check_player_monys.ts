import { db } from "./server/db";
import { players } from "./shared/schema";
import { ilike } from "drizzle-orm";

async function main() {
    const monysList = await db.select().from(players).where(
        ilike(players.gameName, "%Monys%")
    );

    console.log("PLAYERS FOUND:");
    for (const p of monysList) {
        console.log({
            id: p.id,
            accountId: `[${p.accountId}]`,
            zoneId: `[${p.zoneId}]`,
            gameName: p.gameName,
            wins: p.wins,
            losses: p.losses,
            points: p.points
        });
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
