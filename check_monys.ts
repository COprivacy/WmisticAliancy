import { db } from "./server/db";
import { users, players } from "./shared/schema";
import { eq, ilike, or } from "drizzle-orm";
import fs from "fs";

async function main() {
    const allUsers = await db.select().from(users).where(ilike(users.username, "%monys%"));
    const allPlayers = await db.select().from(players).where(
        or(
            ilike(players.accountId, "%monys%"),
            ilike(players.gameName, "%monys%")
        )
    );

    const allPlayersExtended = await Promise.all(
        allPlayers.map(async (p) => {
            // Find the user if possible
            const u = await db.select().from(users).where(eq(users.username, p.accountId));
            return { player: p, user: u };
        })
    );

    const output = {
        users_with_monys_in_username: allUsers,
        players_with_monys: allPlayersExtended
    };

    fs.writeFileSync("monys_data.json", JSON.stringify(output, null, 2));
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
