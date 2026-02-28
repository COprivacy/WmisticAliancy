import Database from 'better-sqlite3';

function search() {
    const sqlite = new Database('sqlite.db');
    const tables = ['users', 'players', 'matches', 'challenges', 'activities'];
    const searchId = '1792001576';

    for (const table of tables) {
        try {
            const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
            console.log(`SQLite Table ${table} has ${rows.length} rows.`);
            const matches = rows.filter(row => JSON.stringify(row).includes(searchId));
            if (matches.length > 0) {
                console.log(`FOUND in ${table}:`, matches);
            }
        } catch (e) {
            console.log(`Table ${table} error:`, (e as any).message);
        }
    }
    sqlite.close();
}
search();
