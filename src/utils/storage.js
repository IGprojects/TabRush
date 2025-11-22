
const STORAGE_KEY = 'guitar_hero_history';

export const getHistory = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to load history", e);
        return [];
    }
};

export const saveGame = (gameData) => {
    try {
        const history = getHistory();
        const newEntry = {
            ...gameData,
            date: new Date().toISOString(),
            id: Date.now().toString() // Simple unique ID
        };
        // Keep only last 50 games
        const updated = [newEntry, ...history].slice(0, 50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error("Failed to save game", e);
        return [];
    }
};
