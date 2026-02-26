import Database from 'better-sqlite3';

const db = new Database('sqlite.db');
const tableInfo = db.prepare('PRAGMA table_info(players)').all();
console.log('Players table info:', tableInfo);
db.close();
