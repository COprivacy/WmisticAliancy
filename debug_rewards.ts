import { db } from "./server/db";
import { rewards } from "./shared/schema";

async function checkRewards() {
    const allRewards = await db.select().from(rewards);
    console.log("💎 Rewards in DB:");
    console.table(allRewards.map(r => ({
        name: r.name,
        rarity: r.rarity,
        stars: r.stars
    })));
}

checkRewards();
