import pg from 'pg';
import "dotenv/config";

async function addCrown() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

    const crown = {
        name: "Coroa da Imortalidade",
        description: "Concedida ao guerreiro que domina a arena por múltiplas temporadas consecutivas.",
        rarity: "mythic",
        stars: 7,
        icon: "/images/rewards/coroa-imortalidade.png"
    };

    try {
        const existing = await pool.query("SELECT * FROM rewards WHERE name = $1", [crown.name]);
        if (existing.rows.length === 0) {
            await pool.query(
                "INSERT INTO rewards (name, description, rarity, stars, icon) VALUES ($1, $2, $3, $4, $5)",
                [crown.name, crown.description, crown.rarity, crown.stars, crown.icon]
            );
            console.log("✅ Coroa da Imortalidade adicionada ao banco de dados!");
        } else {
            console.log("ℹ️ A Coroa já existe no banco de dados.");
        }
    } catch (err) {
        console.error("❌ Erro ao adicionar coroa:", err);
    } finally {
        await pool.end();
    }
}

addCrown();
