import { db } from "./server/db";
import { activities } from "./shared/schema";
import { eq, or, ilike } from "drizzle-orm";

async function main() {
    const monysActs = await db.select().from(activities).where(
        or(
            eq(activities.playerId, 8),
            ilike(activities.playerGameName, "%Monys%"),
            ilike(activities.data, "%Monys%"),
            ilike(activities.data, "%1432804059%")
        )
    ).orderBy(activities.id);

    console.log("ALL ACTIVITIES FOR MONYS:");
    for (const a of monysActs) {
        const dataPreview = a.data ? a.data.substring(0, 100) : "NULL DATA";
        console.log(`ID: ${a.id}, Type: ${a.type}, Data: ${dataPreview}`);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
