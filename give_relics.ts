import { storage } from "./server/storage";
import { db } from "./server/db";
import { playerRewards, rewards } from "./shared/schema";
import { eq, and } from "drizzle-orm";

async function giveRetroactiveRewards() {
    console.log("🎁 Distribuindo relíquias de boas-vindas para veteranos...");

    try {
        const allPlayers = await storage.getPlayers();
        const allRewards = await storage.getRewards();
        const welcomeRelic = allRewards.find(r => r.name === "Selo de Sangue da Aliança");

        if (!welcomeRelic) {
            console.log("❌ Relíquia 'Selo de Sangue da Aliança' não encontrada. Certifique-se de que o servidor rodou o seed.");
            return;
        }

        let count = 0;
        for (const player of allPlayers) {
            // Check if player already has it
            const existing = await db.select().from(playerRewards)
                .where(and(eq(playerRewards.playerId, player.id), eq(playerRewards.rewardId, welcomeRelic.id)));

            if (existing.length === 0) {
                await storage.assignReward(player.id, welcomeRelic.id);
                count++;
            }
        }

        console.log(`✅ Sucesso! ${count} veteranos receberam o Selo de Sangue.`);
    } catch (err) {
        console.error("❌ Erro na distribuição:", err);
    }
}

giveRetroactiveRewards();
