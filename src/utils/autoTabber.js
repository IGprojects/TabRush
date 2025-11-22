import * as Pitchfinder from 'pitchfinder';
import { freqToMidi } from './noteUtils';

// Helper to map MIDI to String/Fret (simplified preference for lower positions)
const midiToStringFret = (midi) => {
    if (!midi) return null;

    // Standard Tuning: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
    const strings = [
        { num: 6, base: 40 },
        { num: 5, base: 45 },
        { num: 4, base: 50 },
        { num: 3, base: 55 },
        { num: 2, base: 59 },
        { num: 1, base: 64 }
    ];

    // Try to find a valid position, preferring strings 6->1 and lower frets
    for (let s of strings) {
        const fret = midi - s.base;
        if (fret >= 0 && fret <= 15) { // Limit to first 15 frets for simplicity
            return { string: s.num, fret };
        }
    }
    return null; // Note out of range
};

export const generateTabFromAudio = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                const float32Array = audioBuffer.getChannelData(0); // Use first channel
                const sampleRate = audioBuffer.sampleRate;

                // Setup Pitchfinder (YIN is good for accuracy)
                const detectPitch = Pitchfinder.YIN({ sampleRate: sampleRate });

                // Analyze in chunks (e.g., every 100ms)
                const windowSize = 0.1; // seconds
                const samplesPerWindow = Math.floor(sampleRate * windowSize);
                const notes = [];

                let lastMidi = null;
                let lastNoteStartTime = 0;

                for (let i = 0; i < float32Array.length; i += samplesPerWindow) {
                    const chunk = float32Array.slice(i, i + samplesPerWindow);
                    const frequency = detectPitch(chunk);
                    const currentTime = i / sampleRate;

                    if (frequency && frequency > 70 && frequency < 1000) { // Filter noise
                        const midi = freqToMidi(frequency);

                        // Simple sustain logic: if same note, extend duration (not implemented in data structure yet, just skipping)
                        // For this MVP, we'll just add a new note if it's different or if enough time passed
                        if (midi !== lastMidi) {
                            const pos = midiToStringFret(midi);
                            if (pos) {
                                notes.push({
                                    string: pos.string,
                                    fret: pos.fret,
                                    time: currentTime,
                                    duration: windowSize
                                });
                            }
                            lastMidi = midi;
                        }
                    } else {
                        lastMidi = null;
                    }
                }

                resolve(notes);

            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};
