import { db } from "./server/db";
import { rewards } from "./shared/schema";
import { eq } from "drizzle-orm";

async function updateStarRatings() {
    console.log("🌟 Atualizando o nível de estrelas das relíquias...");

    const updates = [
        { name: "Espada Suprema da Aliança", stars: 7 },
        { name: "Cajado do Arcanista", stars: 6 },
        { name: "Asas da Vitória", stars: 5 },
        { name: "Medalha de Honra", stars: 3 },
        { name: "Selo de Sangue da Aliança", stars: 2 }
    ];

    try {
        for (const item of updates) {
            await db.update(rewards)
                .set({ stars: item.stars })
                .where(eq(rewards.name, item.name));
        }
        console.log("✅ Estrelas atualizadas com sucesso!");
    } catch (err) {
        console.error("❌ Erro ao atualizar estrelas:", err);
    }
}

updateStarRatings();
