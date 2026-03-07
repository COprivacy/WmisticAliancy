import { createWorker } from 'tesseract.js';

export interface OCRResult {
    text: string;
    isVictory: boolean;
    detectedNames: string[];
}

export async function processMatchScreenshot(imageBuffer: Buffer): Promise<OCRResult> {
    // Use both English and Portuguese for better coverage
    // MLBB victory/defeat screens use English words primarily
    const worker = await createWorker(['eng', 'por']);

    // Tesseract OCR options for better results on game screenshots
    await worker.setParameters({
        tessedit_pageseg_mode: '6' as any, // Assume uniform block of text (better for game UI)
    });

    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    const normalizedText = text.toLowerCase();

    // Patterns for Victory/Defeat
    // MLBB primarily shows "VICTORY" and "DEFEAT" in English
    // Also handle common OCR misreadings like "VICT0RY", "VICTOBY" etc.
    const victoryPatterns = [
        'victory',        // Standard English
        'vitoria',        // Portuguese
        'vitória',        // Portuguese with accent
        'victor',         // Partial (OCR cut-off)
        'ictory',         // Partial (OCR cut-off or "VICTORY" misread)
        'vict0ry',        // OCR digit confusion
        'victofy',        // OCR letter confusion
        'victoby',        // OCR letter confusion
    ];

    const defeatPatterns = [
        'defeat',         // Standard English
        'derrota',        // Portuguese
        'defea',          // Partial
        'defe4t',         // OCR digit confusion
    ];

    const isVictory = victoryPatterns.some(p => normalizedText.includes(p)) &&
        !defeatPatterns.some(p => normalizedText.includes(p));

    return {
        text,
        isVictory,
        detectedNames: []
    };
}
