import pg from 'pg';
import "dotenv/config";

async function initSessionTable() {
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL não configurada.");
        return;
    }

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("🚀 Verificando tabela de sessões...");
        // SQL para criar a tabela de sessões requerida pelo connect-pg-simple
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "session" (
                "sid" varchar NOT NULL COLLATE "default",
                "sess" json NOT NULL,
                "expire" timestamp(6) NOT NULL,
                CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
            ) WITH (OIDS=FALSE);
            CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
        `);
        console.log("✅ Tabela 'session' pronta para uso.");

    } catch (err) {
        console.error("❌ Erro ao criar tabela de session:", err);
    } finally {
        await pool.end();
    }
}

initSessionTable();
