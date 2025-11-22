
// Standard Guitar Tuning (E A D G B e)
// String 6 (Low E) is E2 (MIDI 40)
// String 1 (High e) is E4 (MIDI 64)
const STRING_BASE_NOTES = {
    6: 40, // E2
    5: 45, // A2
    4: 50, // D3
    3: 55, // G3
    2: 59, // B3
    1: 64  // E4
};

/**
 * Converts a frequency in Hz to a MIDI note number.
 */
export const freqToMidi = (freq) => {
    if (!freq) return null;
    // MIDI note = 69 + 12 * log2(freq / 440)
    return Math.round(69 + 12 * Math.log2(freq / 440));
};

/**
 * Calculates the expected MIDI note for a given string and fret.
 */
export const getTargetMidi = (string, fret) => {
    const base = STRING_BASE_NOTES[string];
    if (base === undefined) return null;
    return base + fret;
};

/**
 * Checks if the detected frequency matches the target note.
 * Allows for a small margin of error (e.g., +/- 1 semitone is too loose, maybe check exact MIDI match).
 * Since freqToMidi rounds to the nearest semitone, checking equality is usually enough for "hit".
 */
export const isHit = (detectedFreq, targetString, targetFret) => {
    const detectedMidi = freqToMidi(detectedFreq);
    const targetMidi = getTargetMidi(targetString, targetFret);

    if (!detectedMidi || !targetMidi) return false;

    return detectedMidi === targetMidi;
};
