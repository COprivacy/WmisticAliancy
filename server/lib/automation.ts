import { IStorage } from "../storage";
import { processMatchScreenshot } from "./ocr";
import fs from "fs";
import path from "path";

// Helper to get image buffer
async function getImageBuffer(url: string): Promise<Buffer> {
    if (url.startsWith("http")) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } else {
        const localPath = url.startsWith('/') ? url.substring(1) : url;
        const filePath = path.resolve(process.cwd(), localPath);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        return fs.readFileSync(filePath);
    }
}

/**
 * Cleans a string for fuzzy matching:
 * - Removes accents (é -> e)
 * - Removes all non-alphanumeric characters (✩, ☆, spaces, clan tags brackets, etc.)
 * - Converts to lowercase
 * 
 * Example: "GAM Monys☆" -> "gammonys"
 * Example: "Monys✩" -> "monys"
 */
function cleanString(str: string): string {
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents (à -> a)
        .replace(/[^a-z0-9]/g, ''); // Keep only letters and numbers
}

/**
 * Extract the core part of the player name by removing potential
 * clan tags (e.g. "[GAM]", "GAM ", "[AOE]" etc.)
 * Returns an array of name variants to try:
 * - The original cleaned name
 * - The name without the first "word" (which might be a clan tag like "GAM")
 */
function getNameVariants(name: string): string[] {
    const cleanFull = cleanString(name);
    const variants: string[] = [cleanFull];

    // Try to get just the "core" name by splitting by spaces/special chars
    // In MLBB, a player's name might be displayed as "[TAG] Name" or "TAG Name"
    const parts = name.split(/[\s\[\]|]+/).filter(p => p.length > 1);
    if (parts.length > 1) {
        // Add the last word (usually the actual name) and any part that is >= 4 chars
        for (const part of parts) {
            const cleanPart = cleanString(part);
            if (cleanPart && cleanPart.length >= 3 && !variants.includes(cleanPart)) {
                variants.push(cleanPart);
            }
        }
    }

    return variants;
}

/**
 * Checks if a player's name is present in the OCR text.
 * Uses multiple strategies:
 * 1. Exact cleaned match
 * 2. Partial match of name variants (handles clan tags)
 * 3. Substring of name (min 4 chars) present in cleaned OCR
 */
function isNameFoundInText(playerName: string, cleanedOcrText: string): boolean {
    if (!playerName || !cleanedOcrText) return false;

    const variants = getNameVariants(playerName);

    for (const variant of variants) {
        if (variant.length >= 3 && cleanedOcrText.includes(variant)) {
            return true;
        }
    }

    return false;
}

export async function autoAnalyzeMatch(storage: IStorage, matchId: number) {
    console.log(`[AI] Starting analysis for match ${matchId}...`);

    try {
        const match = await storage.getMatch(matchId);

        if (!match || !match.proofImage) {
            console.log(`[AI] Match ${matchId} not found or has no proof image.`);
            return;
        }

        await storage.updateMatchAiInfo(matchId, "processing");

        const buffer = await getImageBuffer(match.proofImage);
        const result = await processMatchScreenshot(buffer);

        const cleanedOcrText = cleanString(result.text);

        // Log the raw OCR text for debugging
        console.log(`[AI] Match ${matchId} OCR text (first 500 chars):`);
        console.log(result.text.substring(0, 500));
        console.log(`[AI] Match ${matchId} Cleaned OCR text (first 300 chars): ${cleanedOcrText.substring(0, 300)}`);
        console.log(`[AI] Match ${matchId} Victory detected: ${result.isVictory}`);

        const winner = await storage.getPlayerByAccountId(match.winnerId, match.winnerZone);
        const loser = await storage.getPlayerByAccountId(match.loserId, match.loserZone);

        const winnerGameName = winner?.gameName || "";
        const loserGameName = loser?.gameName || "";

        console.log(`[AI] Looking for winner: "${winnerGameName}" → cleaned: "${cleanString(winnerGameName)}"`);
        console.log(`[AI] Looking for loser: "${loserGameName}" → cleaned: "${cleanString(loserGameName)}"`);

        const winnerNameFound = isNameFoundInText(winnerGameName, cleanedOcrText);
        const loserNameFound = isNameFoundInText(loserGameName, cleanedOcrText);

        console.log(`[AI] Winner found? ${winnerNameFound} | Loser found? ${loserNameFound}`);

        // === VALIDATION LOGIC ===
        // The submitter is the LOGGED-IN winner, so if the OCR confirms VICTORY
        // on the screenshot, that is strong enough evidence to auto-approve.
        //
        // Confidence levels:
        //   HIGH  → victory=true  + winner name found in image
        //   MEDIUM→ victory=true  + winner name NOT found (clan tag, font issues)
        //   INCONCLUSIVE → victory=false (screenshot not confirmed as a win)

        const analysisResult = {
            isVictory: result.isVictory,
            winnerNameFound,
            loserNameFound,
            ocrTextPreview: result.text.substring(0, 300),
            timestamp: new Date().toISOString()
        };

        if (result.isVictory) {
            const confidence = winnerNameFound ? "high" : "medium";
            const updatedAnalysis = { ...analysisResult, confidence, autoApproved: true };

            console.log(`[AI] Match ${matchId} APPROVED ✅ (confidence=${confidence}). Auto-approving...`);
            await storage.approveMatch(matchId);
            await storage.updateMatchAiInfo(matchId, "success", JSON.stringify(updatedAnalysis));
        } else {
            // No victory signal found at all — flag for human review
            console.log(`[AI] Match ${matchId} INCONCLUSIVE ⚠️. No victory detected. WinnerNameFound=${winnerNameFound}`);
            await storage.updateMatchAiInfo(matchId, "inconclusive", JSON.stringify({ ...analysisResult, autoApproved: false }));
        }

    } catch (err) {
        console.error(`[AI] Error analyzing match ${matchId}:`, err);
        await storage.updateMatchAiInfo(matchId, "failed", JSON.stringify({ error: String(err) }));
    }
}
