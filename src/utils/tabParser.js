
/**
 * Parses a raw tab input into a structured format for the game engine.
 * 
 * Expected Internal Format (Game Note):
 * {
 *   string: number (1-6, where 1 is High E, 6 is Low E),
 *   fret: number,
 *   time: number (in seconds),
 *   duration: number (optional, for sustain)
 * }
 */

export const parseTab = (input) => {
    // For MVP, we will assume input is a JSON string or object.
    // Future: Add regex parsing for standard ASCII tabs.

    try {
        const data = typeof input === 'string' ? JSON.parse(input) : input;

        if (!Array.isArray(data)) {
            throw new Error("Tab data must be an array of notes.");
        }

        return data.map(note => ({
            string: parseInt(note.string, 10),
            fret: parseInt(note.fret, 10),
            time: parseFloat(note.time),
            duration: note.duration ? parseFloat(note.duration) : 0.5
        })).sort((a, b) => a.time - b.time);

    } catch (e) {
        console.error("Failed to parse tab:", e);
        return [];
    }
};

// Example song for testing
export const DEMO_SONG = [
    { string: 6, fret: 0, time: 1.0 }, // Low E open
    { string: 6, fret: 3, time: 2.0 }, // G
    { string: 5, fret: 2, time: 3.0 }, // B
    { string: 4, fret: 0, time: 4.0 }, // D open
    { string: 3, fret: 0, time: 5.0 }, // G open
    { string: 2, fret: 3, time: 6.0 }, // D
    { string: 1, fret: 3, time: 7.0 }, // G
];
