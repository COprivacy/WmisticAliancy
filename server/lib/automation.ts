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
        // Handle local paths
        // Convert /uploads/xxx to ./uploads/xxx
        const localPath = url.startsWith('/') ? url.substring(1) : url;
        const filePath = path.resolve(process.cwd(), localPath);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        return fs.readFileSync(filePath);
    }
}

export async function autoAnalyzeMatch(storage: IStorage, matchId: number) {
    console.log(`[AI] Starting analysis for match ${matchId}...`);

    try {
        // Fetch the match from DB to get the image URL
        const match = await storage.getMatch(matchId);

        if (!match || !match.proofImage) {
            console.log(`[AI] Match ${matchId} not found or has no proof image.`);
            return;
        }

        // Update status to processing
        await storage.updateMatchAiInfo(matchId, "processing");

        const buffer = await getImageBuffer(match.proofImage);
        const result = await processMatchScreenshot(buffer);

        const normalizedText = result.text.toLowerCase();

        // Match names
        const winner = await storage.getPlayerByAccountId(match.winnerId, match.winnerZone);
        const loser = await storage.getPlayerByAccountId(match.loserId, match.loserZone);

        const winnerNameFound = winner && normalizedText.includes(winner.gameName.toLowerCase());
        const loserNameFound = loser && normalizedText.includes(loser.gameName.toLowerCase());

        // Confidence: Victory detected + Winner name detected
        // Note: Sometimes the loser name might not be on the same screen (MVP screen),
        // so we prioritize the winner name and the Victory message.
        const isFullyValidated = result.isVictory && winnerNameFound;

        const analysisResult = {
            ...result,
            winnerNameFound,
            loserNameFound,
            autoApproved: isFullyValidated,
            timestamp: new Date().toISOString()
        };

        if (isFullyValidated) {
            console.log(`[AI] Match ${matchId} VALIDATED. Auto-approving...`);
            await storage.approveMatch(matchId);
            await storage.updateMatchAiInfo(matchId, "success", JSON.stringify(analysisResult));
        } else {
            console.log(`[AI] Match ${matchId} INCONCLUSIVE. WinnerNameFound: ${winnerNameFound}, VictoryDetected: ${result.isVictory}`);
            await storage.updateMatchAiInfo(matchId, "inconclusive", JSON.stringify(analysisResult));
        }

    } catch (err) {
        console.error(`[AI] Error analyzing match ${matchId}:`, err);
        await storage.updateMatchAiInfo(matchId, "failed", JSON.stringify({ error: String(err) }));
    }
}
