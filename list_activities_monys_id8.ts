import { db } from "./server/db";
import { activities } from "./shared/schema";
import { eq, or } from "drizzle-orm";

async function main() {
    const monysActs = await db.select().from(activities).where(
        eq(activities.playerId, 8)
    );

    console.log("ACTIVITIES FOR MONYS ID 8:");
    for (const a of monysActs) {
        console.log(`ID: ${a.id}, Type: ${a.type}, Data: ${a.data}`);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
