import Database from 'better-sqlite3';
const sqlite = new Database('sqlite.db');
const count = sqlite.prepare("SELECT COUNT(*) as count FROM users").get();
console.log("Users count:", (count as any).count);
sqlite.close();
