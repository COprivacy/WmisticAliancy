import "dotenv/config";
import { db } from './server/db';
import { players } from './shared/schema';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
    const admin = await db.select().from(players).where(eq(players.accountId, '1792001576'));
    console.log(JSON.stringify(admin, null, 2));
    process.exit(0);
}

checkAdmin();
