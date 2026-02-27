import { db } from "./server/db";
import { rewards } from "./shared/schema";
import { eq } from "drizzle-orm";

async function fixIconPath() {
    console.log("🖼️ Atualizando caminho do ícone do Selo de Sangue...");

    try {
        await db.update(rewards)
            .set({ icon: "/images/rewards/recruit-badge.png" })
            .where(eq(rewards.name, "Selo de Sangue da Aliança"));

        console.log("✅ Caminho atualizado no banco de dados.");
    } catch (err) {
        console.error("❌ Erro ao atualizar ícone:", err);
    }
}

fixIconPath();
