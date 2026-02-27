import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function addCol() {
    console.log("🔨 Adicionando coluna 'stars' manualmente...");
    try {
        await db.run(sql`ALTER TABLE rewards ADD COLUMN stars INTEGER NOT NULL DEFAULT 1`);
        console.log("✅ Coluna 'stars' adicionada!");

        // Now update them
        const updates = [
            { name: "Espada Suprema da Aliança", stars: 7 },
            { name: "Cajado do Arcanista", stars: 6 },
            { name: "Asas da Vitória", stars: 5 },
            { name: "Medalha de Honra", stars: 3 },
            { name: "Selo de Sangue da Aliança", stars: 2 }
        ];

        for (const item of updates) {
            await db.run(sql`UPDATE rewards SET stars = ${item.stars} WHERE name = ${item.name}`);
        }
        console.log("✅ Estrelas atualizadas!");
    } catch (err) {
        console.error("❌ Erro:", err);
    }
}

addCol();
