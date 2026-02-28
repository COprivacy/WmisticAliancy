import Database from 'better-sqlite3';
import pkg from 'pg';
const { Pool } = pkg;
import "dotenv/config";

async function migrate() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL must be set");
    }

    const sqlite = new Database('sqlite.db');
    const pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    console.log("🚀 Iniciando migração de SQLite para Postgres...");

    const tables = [
        'users',
        'players',
        'rewards',
        'player_rewards',
        'matches',
        'seasons',
        'challenges',
        'activities',
        'reactions'
    ];

    const booleanColumns: Record<string, string[]> = {
        'players': ['is_banned']
    };

    const timestampColumns: Record<string, string[]> = {
        'players': ['last_claimed_at'],
        'matches': ['created_at'],
        'player_rewards': ['assigned_at', 'expires_at'],
        'seasons': ['ended_at'],
        'challenges': ['scheduled_at', 'created_at'],
        'activities': ['created_at'],
        'reactions': ['created_at']
    };

    for (const table of tables) {
        console.log(`📦 Migrando tabela: ${table}...`);

        let rows: any[] = [];
        try {
            rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
        } catch (e: any) {
            console.log(`⚠️ Tabela ${table} não encontrada ou erro: ${e.message}. Pulando.`);
            continue;
        }

        if (rows.length === 0) {
            console.log(`ℹ️ Tabela ${table} está vazia.`);
            continue;
        }

        const columns = Object.keys(rows[0]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertQuery = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${columns.map(c => `${c} = EXCLUDED.${c}`).join(', ')}`;

        const client = await pgPool.connect();
        try {
            await client.query('BEGIN');
            for (const row of rows) {
                const pgValues = columns.map(col => {
                    let val = (row as any)[col];
                    if (val === null) return null;

                    if (booleanColumns[table]?.includes(col)) {
                        return val === 1 || val === true || val === '1';
                    }

                    if (timestampColumns[table]?.includes(col)) {
                        if (typeof val === 'number') return new Date(val);
                        if (typeof val === 'string') {
                            if (val.includes(' ') && !val.includes('T')) {
                                val = val.replace(' ', 'T') + 'Z';
                            }
                            return new Date(val);
                        }
                    }

                    return val;
                });

                await client.query(insertQuery, pgValues);
            }
            await client.query('COMMIT');
            console.log(`✅ ${rows.length} registros migrados em ${table}.`);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`❌ Erro ao migrar ${table}:`, err);
        } finally {
            client.release();
        }
    }

    console.log("🔄 Atualizando sequências de IDs...");
    for (const table of tables) {
        try {
            await pgPool.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1)) FROM ${table}`);
        } catch (e) {
            // Ignore
        }
    }

    console.log("🏁 Migração concluída com sucesso!");
    sqlite.close();
    await pgPool.end();
}

migrate().catch(console.error);
