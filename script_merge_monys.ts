import { db } from "./server/db";
import { players } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const p3 = await db.select().from(players).where(eq(players.id, 3));
    const p8 = await db.select().from(players).where(eq(players.id, 8));

    if (!p3.length || !p8.length) {
        console.log("Players not found!");
        process.exit(1);
    }

    const player3 = p3[0];
    const player8 = p8[0];

    // Merge points
    const mergedPoints = 100 + (player8.points - 100) + (player3.points - 100);
    const mergedWins = player8.wins + player3.wins;
    const mergedLosses = player8.losses + player3.losses;
    const mergedGlory = player8.gloryPoints + player3.gloryPoints;
    const rank = mergedPoints >= 300 ? "Guerreiro" : (mergedPoints >= 100 ? "Soldado" : "Recruta");

    // Clean account/zone ID
    const cleanAccountId = player8.accountId.trim();
    const cleanZoneId = player8.zoneId.trim();

    // Update Player 8
    await db.update(players).set({
        points: mergedPoints,
        wins: mergedWins,
        losses: mergedLosses,
        gloryPoints: mergedGlory,
        rank,
        avatar: player3.avatar || player8.avatar,
        accountId: cleanAccountId,
        zoneId: cleanZoneId,
        lastClaimedAt: player8.lastClaimedAt && player3.lastClaimedAt
            ? (new Date(player8.lastClaimedAt) > new Date(player3.lastClaimedAt) ? player8.lastClaimedAt : player3.lastClaimedAt)
            : (player8.lastClaimedAt || player3.lastClaimedAt)
    }).where(eq(players.id, 8));

    // Delete Player 3
    await db.delete(players).where(eq(players.id, 3));

    console.log("Merged player instances successfully:");
    console.log(`Kept ID: 8 (Points: ${mergedPoints}, Glory: ${mergedGlory}, Wins: ${mergedWins})`);
    console.log("Deleted ID: 3");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
