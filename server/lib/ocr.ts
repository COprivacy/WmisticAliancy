import { createWorker } from 'tesseract.js';

export interface OCRResult {
    text: string;
    isVictory: boolean;
    detectedNames: string[];
}

export async function processMatchScreenshot(imageBuffer: Buffer): Promise<OCRResult> {
    const worker = await createWorker('por'); // Using Portuguese

    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    const normalizedText = text.toLowerCase();

    // Basic patterns for Victory/Defeat
    const victoryPatterns = ['victory', 'vitoria', 'vitória', 'mvp', 'vitoria da', 'vitoria mvp'];
    const defeatPatterns = ['defeat', 'derrota', 'derrota da', 'derrota mvp'];

    const isVictory = victoryPatterns.some(p => normalizedText.includes(p)) &&
        !defeatPatterns.some(p => normalizedText.includes(p));

    // Extract potential names (this is tricky with just OCR)
    // Usually, we'll want to match detected names against our database
    // For now, we return the full text for more advanced matching later

    return {
        text,
        isVictory,
        detectedNames: [] // We'll implement name matching in the route
    };
}
