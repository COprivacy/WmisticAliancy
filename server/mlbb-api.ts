// Base URL for the public API defined in the search results
const BASE_URL = "https://mlbb-stats.ridwaanhall.com/api";

export interface MLBBHero {
    id: string;
    name: string;
    role: string;
    specialty: string;
    // ... other fields from API
}

export async function getHeroDetails(heroId: string): Promise<MLBBHero | null> {
    try {
        const response = await fetch(`${BASE_URL}/hero-detail/${heroId}`);
        if (!response.ok) return null;
        return await response.json() as MLBBHero;
    } catch (error) {
        console.error("Error fetching hero details:", error);
        return null;
    }
}

// Note: Player stats might require specific endpoints or keys if the public API provides them
// Based on documentation, we can integrate hero data immediately.
