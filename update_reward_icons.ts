import Database from 'better-sqlite3';

const db = new Database('sqlite.db');

try {
    db.prepare("UPDATE rewards SET icon = '/images/rewards/epic-wings.svg' WHERE name = 'Asas da Vitória'").run();
    db.prepare("UPDATE rewards SET icon = '/images/rewards/rare-medal.svg' WHERE name = 'Medalha de Honra'").run();
    console.log('Reward icons updated successfully to SVG.');
} catch (e) {
    console.error('Update failed:', e);
} finally {
    db.close();
}
