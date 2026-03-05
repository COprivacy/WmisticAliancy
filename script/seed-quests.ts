import { storage } from "../server/storage";

async function seedQuests() {
    console.log("Seeding quests...");

    const dailyQuests = [
        {
            title: "Guerreiro Proativo",
            description: "Resgate seu bônus diário na aba perfil.",
            difficulty: "easy",
            points: 5,
            glory: 2,
            type: "daily_claim",
            target: 1
        },
        {
            title: "Duelo de Honra",
            description: "Complete 3 partidas na arena.",
            difficulty: "medium",
            points: 15,
            glory: 5,
            type: "matches",
            target: 3
        },
        {
            title: "Mestre da Arena",
            description: "Vença 2 partidas na arena.",
            difficulty: "hard",
            points: 25,
            glory: 10,
            type: "wins",
            target: 2
        },
        {
            title: "Invencível",
            description: "Consiga uma sequência de 3 vitórias.",
            difficulty: "epic",
            points: 50,
            glory: 20,
            type: "streak",
            target: 3
        }
    ];

    const existingQuests = await storage.getQuests();

    for (const q of dailyQuests) {
        const alreadyExists = existingQuests.find(eq => eq.title === q.title);
        if (!alreadyExists) {
            console.log(`Creating quest: ${q.title}`);
            await storage.createQuest(q);
        } else {
            console.log(`Updating quest: ${q.title} (glory: ${alreadyExists.glory} -> ${q.glory})`);
            await storage.updateQuest(alreadyExists.id, {
                description: q.description,
                points: q.points,
                glory: q.glory,
                target: q.target
            });
        }
    }

    console.log("Quests seeded!");
    process.exit(0);
}

seedQuests().catch(err => {
    console.error(err);
    process.exit(1);
});
