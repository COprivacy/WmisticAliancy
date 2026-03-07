import { db } from "./server/db";
import { activities } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const matchApproved = await db.select().from(activities).where(
        eq(activities.type, "match_approved")
    ).orderBy(activities.id);

    console.log("MATCH APPROVED ACTIVITIES:");
    for (const a of matchApproved) {
        console.log(`ID: ${a.id}, Player: ${a.playerGameName}, Type: ${a.type}, Data: ${a.data}`);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
