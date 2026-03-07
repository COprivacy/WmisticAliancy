import { db } from "./server/db";
import { players } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const accountId = "20344313";
    const zoneId = "3220";

    // Update Player 4 (Soldado_3220) with the corrected ID and Zone
    const result = await db.update(players)
        .set({
            accountId: accountId,
            zoneId: zoneId,
            gameName: "L", // Based on the avatar in the image (L from Death Note)
            currentRank: "Verificado"
        })
        .where(eq(players.id, 4));

    console.log("Player updated successfully to ID 20344313 and Zone 3220.");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
