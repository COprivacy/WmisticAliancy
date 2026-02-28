import fs from 'fs';
import path from 'path';

// Como usar: 
// 1. Adicione os itens na lista abaixo
// 2. Rode no terminal: npx tsx script/bulk-add-relics.ts
const NOVAS_RELIQUIAS = [
    /* Exemplo:
    {
      "name": "Nova Relíquia",
      "description": "Uma descrição épica.",
      "rarity": "epic",
      "stars": 5,
      "icon": "/images/rewards/default.png"
    },
    */
];

const relicsPath = path.resolve(process.cwd(), "shared", "relics.json");

function updateRelics() {
    if (!fs.existsSync(relicsPath)) {
        fs.writeFileSync(relicsPath, JSON.stringify([], null, 2));
    }

    const currentRelics = JSON.parse(fs.readFileSync(relicsPath, 'utf-8'));
    let addedCount = 0;

    for (const newItem of NOVAS_RELIQUIAS) {
        if (!currentRelics.find((r: any) => r.name === newItem.name)) {
            currentRelics.push(newItem);
            addedCount++;
        }
    }

    fs.writeFileSync(relicsPath, JSON.stringify(currentRelics, null, 2));
    console.log(`✅ Adição em massa concluída!`);
    console.log(`✨ ${addedCount} novas relíquias adicionadas ao arquivo shared/relics.json.`);
    console.log(`🚀 O servidor irá carregar as novas relíquias automaticamente no próximo reinício.`);
}

if (NOVAS_RELIQUIAS.length > 0) {
    updateRelics();
} else {
    console.log("ℹ️ Nenhuma nova relíquia na lista. Edite o script script/bulk-add-relics.ts para adicionar itens.");
}
