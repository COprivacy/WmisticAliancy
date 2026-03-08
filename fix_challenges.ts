import "dotenv/config";
import { db } from "./server/db";
import { challenges } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Fixing challenges table IDs...");
    const all = await db.select().from(challenges);
    for (const c of all) {
        const tChallengerId = c.challengerId.trim();
        const tChallengerZone = c.challengerZone.trim();
        const tChallengedId = c.challengedId.trim();
        const tChallengedZone = c.challengedZone.trim();

        if (c.challengerId !== tChallengerId || c.challengerZone !== tChallengerZone ||
            c.challengedId !== tChallengedId || c.challengedZone !== tChallengedZone) {
            console.log(`Fixing challenge ${c.id}: [${c.challengerId}] vs [${c.challengedId}]`);
            await db.update(challenges).set({
                challengerId: tChallengerId,
                challengerZone: tChallengerZone,
                challengedId: tChallengedId,
                challengedZone: tChallengedZone
            }).where(eq(challenges.id, c.id));
        }
    }
    console.log("Challenges fixed.");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
