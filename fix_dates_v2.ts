import { db } from "./server/db";
import { activities, matches, challenges, reactions, playerRewards } from "./shared/schema";
import { sql } from "drizzle-orm";

async function fixTimestamps() {
    console.log("🛠️ Tentativa 2: Corrigindo datas bugadas...");
    const now = new Date();

    try {
        // No SQLite, o Drizzle às vezes mapeia Date como milissegundos ou como string.
        // Vamos tentar forçar a atualização de todas as linhas que pareçam erradas.

        // Deletar atividades que estão obviamente bugadas se não conseguir atualizar
        // Mas primeiro vamos tentar o update novamente com um valor bem explícito.
        const resultAct = await db.update(activities).set({ createdAt: now });
        console.log(`✅ Forçadas todas as atividades para agora.`);

        const resultMat = await db.update(matches).set({ createdAt: now });
        const resultCha = await db.update(challenges).set({ createdAt: now });
        const resultRea = await db.update(reactions).set({ createdAt: now });
        const resultRew = await db.update(playerRewards).set({ assignedAt: now });

        console.log("✨ Tudo limpo e forçado para a data atual!");
    } catch (err) {
        console.error("❌ Erro ao corrigir:", err);
    }
}

fixTimestamps();
