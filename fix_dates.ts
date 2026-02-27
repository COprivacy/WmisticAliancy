import { db } from "./server/db";
import { activities, matches, challenges, reactions, playerRewards } from "./shared/schema";
import { sql } from "drizzle-orm";

async function fixTimestamps() {
    console.log("🛠️ Corrigindo datas bugadas...");
    const now = new Date();

    try {
        const act = await db.update(activities).set({ createdAt: now }).where(sql`created_at = 0 OR created_at IS NULL OR created_at = 'CURRENT_TIMESTAMP'`);
        console.log(`✅ Atividades corrigidas.`);

        const mat = await db.update(matches).set({ createdAt: now }).where(sql`created_at = 0 OR created_at IS NULL OR created_at = 'CURRENT_TIMESTAMP'`);
        console.log(`✅ Partidas corrigidas.`);

        const cha = await db.update(challenges).set({ createdAt: now }).where(sql`created_at = 0 OR created_at IS NULL OR created_at = 'CURRENT_TIMESTAMP'`);
        console.log(`✅ Desafios corrigidos.`);

        const rea = await db.update(reactions).set({ createdAt: now }).where(sql`created_at = 0 OR created_at IS NULL OR created_at = 'CURRENT_TIMESTAMP'`);
        console.log(`✅ Reações corrigidas.`);

        const rew = await db.update(playerRewards).set({ assignedAt: now }).where(sql`assigned_at = 0 OR assigned_at IS NULL OR assigned_at = 'CURRENT_TIMESTAMP'`);
        console.log(`✅ Recompensas corrigidas.`);

        console.log("✨ Tudo limpo!");
    } catch (err) {
        console.error("❌ Erro ao corrigir:", err);
    }
}

fixTimestamps();
