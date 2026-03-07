import { db } from "./server/db";
import { activities } from "./shared/schema";

async function main() {
    const allActivities = await db.select().from(activities).orderBy(activities.id);

    console.log("ALL ACTIVITIES:");
    for (const a of allActivities) {
        console.log({
            id: a.id,
            playerId: a.playerId,
            playerGameName: a.playerGameName,
            type: a.type
        });
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
