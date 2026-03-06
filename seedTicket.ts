import { db } from './server/db';
import { rewards } from './shared/schema';
import { eq } from 'drizzle-orm';

async function seed() {
    const existing = await db.select().from(rewards).where(eq(rewards.name, 'Ticket Arena'));
    if (existing.length === 0) {
        await db.insert(rewards).values({
            name: 'Ticket Arena',
            description: 'Garante +1 ingresso para batalhar e registrar duelos na Sala de Guerra.',
            rarity: 'epic',
            stars: 3,
            icon: 'https://cdn-icons-png.flaticon.com/512/2630/2630732.png',
            type: 'ticket',
            price: 10,
            isAvailableInStore: true,
            isRankPrize: false
        });
        console.log('Ticket Arena inserted!');
    } else {
        console.log('Already exists');
    }
    process.exit(0);
}

seed().catch(console.error);
